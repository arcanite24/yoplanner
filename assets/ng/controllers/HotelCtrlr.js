/*
 *
 */
'use strict';

var HotelModule = angular.module('yoPlannerApp.hotel', ['ngAnimate', 'ngStorage', 'uiGmapgoogle-maps','cgNotify']);


HotelModule.config(function(uiGmapGoogleMapApiProvider) {



});

HotelModule.controller('HotelController', function($scope, $http, $log, $timeout, $rootScope,$localStorage,notify){
	$scope.searchId;
	$scope.hotelRatings = [];
	$scope.masResultados = function(){
		console.debug("masResultados",$scope.searchId)
		var searchId = $scope.searchId;
		$http.get("/recinto/findByCiudadId/"+searchId+"?p="+$scope.currentPage).success(function (data){
			if(data) {
				for (var i = 0; i < data.length; i++) {
					data[i]['starRatingRange'] = new Array(data[i].starRating);
				};
			}

			console.log('MAS HOTELES', data);
			$scope.hotelesNew = $scope.hotelesNew.concat(data);
			if(data && data.length > 0) {
				$scope.currentPage++;
			}
		}).error(function (err){
			$log.error(err);
			$scope.showLoader = false;
		});

    };

		//Cargar hoteles
		$scope.loadNewHoteles = function () {
			$http.get('/recinto/findByCiudadId/' + $scope.searchId).success(function(data) {
				console.log(data);
				for (var i = 0; i < data.length; i++) {
					data[i]['starRatingRange'] = new Array(data[i].starRating);
				};
				$scope.hotelesNew = data;
			});
		}

		$scope.getStars = function (num) {
			return new Array(num);
		}

		//Buscar por estrellas
		$scope.filterStar = function (buscar) {
			return function (item) {
				if (buscar.fivestar) {
					if (item.starRating == 5) {
						return item;
					} else {
						if (buscar.fourstar) {
							if (item.starRating == 4) {
								return item;
							} else {
								console.log('ni 4 ni 5');
							}
						}
					}
				} else if (buscar.fourstar) {
					if (item.starRating == 4) {
						return item;
					} else {
						console.log('ni 4 ni 5');
					}
				} else if (buscar.threestar) {
					if (item.starRating == 3) {
						return item;
					} else {
						console.log('ni 4 ni 5 ni 3');
					}
				}
			};
		};

		//Filter numero de salones
		$scope.filterSalones = function (num) {
			return function (hotel) {
				if (!num) {
					return hotel;
				}
				if (!hotel.numeroSalones) {
					return null;
				}
				return hotel.numeroSalones >= num;
			}
		};
		//Filter numero de habitaciones
		$scope.filterHabitaciones = function (num) {
			return function (hotel) {
				if (!num) {
					return hotel;
				}
				if (!hotel.totalHabitaciones) {
					return null;
				}
				return hotel.totalHabitaciones >= num;
			}
		};
		//Filter tipo plan
		$scope.filterPlan = function (plan) {
			return function (hotel) {
				if (plan == 'default') {
					return hotel;
				}
				return hotel.plan == plan;
			}
		};

		//Filtrado de hoteles  por http
		$scope.buscarTodos = function (buscar) {
			$scope.cargandoBusqueda = true;
			$http.post('/recinto/findBySearch', {buscar: buscar, id: $scope.searchId}).success(function(data) {
				$scope.cargandoBusqueda = false;
				$scope.showMostrarMas = false;
				$scope.hotelesNew = data;
			});
		};

		$scope.initGallery = function () {
			//Adaptar imagenes la formato de la directiva
			$scope.galleryPictures = [];
			$scope.galleryPromotions = [];
			$http.get("/recinto/findById/"+$scope.hotelid).success(function(hotel){
				hotel.pictures.forEach(function (picture) {
					$scope.galleryPictures.push({img: picture, thumb: picture});
				});
				if (hotel.promotions) {
					hotel.promotions.forEach(function (picture) {
						$scope.galleryPromotions.push({img: picture, thumb: picture});
					});
				}
			});
		};

    $scope.agregarYRegresar = function() {
    	notify('Hotel agregado a Mi Selección');
      $rootScope.hotelesSeleccionados.push($scope.currentHotel);
			$scope.showAddButtonCurHot = $scope.existeEnSeleccion($scope.currentHotel);
      $localStorage.hotelesSeleccionados = JSON.stringify($rootScope.hotelesSeleccionados);

			$http.post('/recinto/getHotelEmail', {id: id}).success(function(data) {
				console.log($rootScope.hotelesSeleccionados);
				console.log(data.id);
				for (var i in $rootScope.hotelesSeleccionados) {
					if ($rootScope.hotelesSeleccionados[i].id == data.id) {
						$rootScope.hotelesSeleccionados[i].email = data.email;
						console.log('Email cargado');
					}
				}
			});
    };

		$scope.addSeleccion = function (id) {
			for (var i in $rootScope.hotelesSeleccionados) {
				if ($rootScope.hotelesSeleccionados[i].id == id) {
					notify('Este hotel ya está en Mi Selección');
					return;
				}
			}

			$http.get("/recinto/findById/"+id).then(function (hotel) {
				$rootScope.hotelesSeleccionados.push(hotel.data);
				$localStorage.hotelesSeleccionados = JSON.stringify($rootScope.hotelesSeleccionados);
				notify('Hotel ' + hotel.data.name + ' agregado a Mi Selección');

				$http.post('/recinto/getHotelEmail', {id: id}).success(function(data) {
					console.log($rootScope.hotelesSeleccionados);
					console.log(data.id);
					for (var i in $rootScope.hotelesSeleccionados) {
						if ($rootScope.hotelesSeleccionados[i].id == data.id) {
							$rootScope.hotelesSeleccionados[i].email = data.email;
							console.log('Email cargado');
						}
					}
				});

			});
		};

		//Reply logic
		$scope.replyComentario = function (comentario) {
			var text = $scope.reply.text[comentario.id];
			$http.post('/comentariohotel/addReply', {id: comentario.id, replytext: text}).success(function(data) {
				$scope.reply.text[comentario.id] = null;
				console.log(data);
				$scope.comentarios[$scope.comentarios.indexOf(comentario)].replies = data.replies;
				notify('Respuesta enviada.');
			}).error(function (err) {
				console.log(err);
			});
		};

		$scope.deleteReply = function (comentario, reply) {
			$http.post('/comentariohotel/deleteReply', {id: comentario.id, reply: reply}).success(function(data) {
				$scope.comentarios[$scope.comentarios.indexOf(comentario)].replies = data.replies;
				notify('Respuesta eliminada.');
			}).error(function (err) {
				console.log(err);
			});
		};

		$scope.saveReply = function (comentario, reply) {
			console.log('EDITANDO REPLY', $scope.reply.text_edit[reply.createdAt]);
			var newtext = $scope.reply.text_edit[reply.createdAt];
			$http.post('/comentariohotel/editReply', {id: comentario.id, reply: reply, newtext: newtext}).success(function(data) {
				$scope.reply.isEditing[reply.createdAt] = false;
				$scope.comentarios[$scope.comentarios.indexOf(comentario)].replies = data.replies;
				notify('Respuesta editada.');
			}).error(function (err) {
				console.log(err);
			});
		};

    $rootScope.existeEnSeleccion = function(hotel){
    	$log.info("HOTEL>>>>>>>>>>>>>>>>",hotel);
    	$log.info("SELS>>>>>>>>>>>>>>>>",$rootScope.hotelesSeleccionados);
    	if(hotel==null)return -1;
        for(var i=0;i<$rootScope.hotelesSeleccionados.length;i++){
            if(hotel.id == $rootScope.hotelesSeleccionados[i].id){
                return i;
            };
        };
        return -1;
    };

    $rootScope.deleteSelection = function(hotel){
      $rootScope.hotelesSeleccionados.splice($scope.existeEnSeleccion(hotel),1);
	 		$scope.showAddButtonCurHot = $scope.existeEnSeleccion($scope.currentHotel);
      $localStorage.hotelesSeleccionados = JSON.stringify($rootScope.hotelesSeleccionados);
    };

		//Comentarios en detalle hotel
		// TODO: Implementar paginación
		$scope.loadComentarios = function () {
			$scope.pagina = 1;
			$scope.comment_count = 0;
			$scope.comentariosCargados = true;
			$http.post('/comentariohotel/getComentarios/', {id: $scope.hotelid, page: $scope.pagina}).success(function(data) {
				$scope.pagina += 1;
				$scope.comment_count = data.count;
				$scope.comentarios = data.comentarios;
				$scope.comentariosCargados = false;
				console.log('COUNT COMMET', $scope.comment_count);
			}).error(function (err) {
				console.log(err);
			});
		};

		$http.get('/comentariohotel/getUser').success(function(data) {
			$scope.rootuser = data;
		}).error(function (err) {
			console.log(err);
		});

		$scope.loadMoreComentarios = function () {
			$scope.comentariosCargados = true;
			$http.post('/comentariohotel/getComentarios/', {id: $scope.hotelid, page: $scope.pagina}).success(function(data) {
				$scope.pagina += 1;
				$scope.comment_count = data.count;
				$scope.comentariosCargados = false;
				if (data.comentarios.length <= 0) {
					notify('No hay más comentarios que cargar...');
				} else {
					console.log('NUEVO COMMENTS', data.comentarios);
					data.comentarios.forEach(function (comentario) {
						$scope.comentarios.push(comentario);
					});
				}
			}).error(function (err) {
				console.log(err);
			});
		};

		//Auxiliar para las imágenes anteriores al cambio de ruta
		$scope.imagenValida = function (url) {
			return url.includes('admin.yoplanner.com');
		};

		$scope.postComentario = function () {
			if(!$scope.postcomentario.text)
				return;

			$http.post('/comentariohotel/postComentario', {text: $scope.postcomentario.text, title:$scope.postcomentario.title, hotel: $scope.hotelid}).success(function(data) {
				$scope.postcomentario = null;
				notify('Comentario enviado correctamente.');
				$scope.comentarios.push(data.comentario);
			}).error(function (err) {
				console.log(err);
			});
		};

		$scope.saveComment = function (comentario) {
			var newtext = comentario.editText;
			$http.post('/comentariohotel/editComment', {id: comentario.id, newtext: newtext}).success(function(data) {
				$scope.comentarios[$scope.comentarios.indexOf(comentario)].isEditing = false;
				$scope.comentarios[$scope.comentarios.indexOf(comentario)].text = data.text;
				notify('Comentario editado.');
			}).error(function (err) {
				console.log(err);
			});
		};

		$scope.like = function (comentario) {
			if (!comentario.likes) {
				comentario.likes = [];
			}
			$http.post('/comentariohotel/like', {comentario: comentario}).success(function(data) {
				console.log(data);
				if (data.error) {
					notify(data.message);
					return;
				}
				for (var a in $scope.comentarios) {
					if ($scope.comentarios[a].id == data.id) {
						$scope.comentarios[a].likes = data.likes;
						return;
					}
				}
			});
		};

		$scope.fechaComentario = function (comentario) {
			var fecha = new Date(comentario.createdAt);
			return fecha;
		};

		//Test cargar info de contacto
		$scope.initInfoContacto = function (id) {
			$http.post('/recinto/getContactoInfo', {id: id}).success(function(data) {
			  console.log(data);
				if (data.length > 0) {
					$scope.contactoinfo = data[0];
					console.log(data[0]);
				}
			}).error(function (err) {
				console.log(err);
			});
		};

		$scope.deleteComment = function (comentario) {
			$http.post('/comentariohotel/deleteComment', {id: comentario.id}).success(function(data) {
			  console.log('DELETE COMMENT', data);
				$scope.comentarios.splice($scope.comentarios.indexOf(comentario), 1);
			}).error(function (err) {
				console.log(err);
			});
		};

		//Ratings
		$scope.rateHotel = function () {
			console.log('RATING', $scope.hotelRating);
			$http.post('/recinto/rateHotel', {hotel: $scope.hotelid, rating: $scope.hotelRating}).success(function(data) {
				$scope.hotelRatings = data.hotel.ratings;
				notify('Hotel calificado con ' + $scope.hotelRating + ' estrellas.');
			});
		}

		$scope.averageRating = function (ratings) {
			var suma = 0;
			ratings.forEach(function (rate) {
				suma += rate.rating;
			});
			return (suma / ratings.length) || 0;
		}

		$scope.loadUserRating = function (hotel) {
			$http.post('/recinto/getUserRating', {id: hotel}).success(function(data) {
			  $scope.hotelRating = data.rating;
			}).error(function (err) {
				console.log(err);
			});
		}

		$scope.initRatings = function (id) {
			$http.post('/recinto/getRatings', {id: id}).success(function(data) {
			  $scope.hotelRatings = data.ratings;
			}).error(function (err) {
				console.log(err);
			});
		}

		$scope.sorthotel = 0;

		$scope.sortSocial = function (hotel) {
			switch ($scope.sorthotel) {
				case 0:
					return hotel.place;
					break;
				case 1:
					return hotel.likes.length;
					break;
				case 2:
					return hotel.visitas;
					break;
				case 3:
					if (hotel.comentarios) {
						return hotel.comentarios.length;
					}
					return hotel.place;
					break;
				default:
					return hotel.place;
			}
		}

		//favoritos
		$scope.isOnFav = function (id) {
			$http.get('/recinto/isonfav/', {id: id}).success(function(data) {
				$scope.isFav = data.isFav;
			});
			$http.get('/recinto/isliked/', {id: id}).success(function(data) {
				$scope.isLiked = data.isLiked;
			});
		}

		$scope.addFav = function (id) {
			$http.post('/recinto/addfav/', {id: id}).success(function(data) {
				console.log('ADDED FAV', data.favoritos);
				$scope.isFav = true;
			});
		}

		$scope.removeFav = function (id) {
			$http.post('/recinto/removefav/', {id: id}).success(function(data) {
				console.log('REMOVED FAV', data.favoritos);
				$scope.isFav = false;
			});
		}

		//likes
		$scope.likeHotel = function (id) {
			$http.post('/recinto/likeHotel/', {id: id}).success(function(data) {
				console.log('ADDED LIKE', data.likes);
				$scope.isLiked = true;
			});
		}

		$scope.notlikeHotel = function (id) {
			$http.post('/recinto/notlikeHotel/', {id: id}).success(function(data) {
				console.log('REMOVED LIKE', data.likes);
				$scope.isLiked = false;
			});
		}

	$scope.init = function() {
		$scope.moreHotels = [];
 		$scope.showMostrarMas = true;
 		$scope.currentPage = 1;
		$rootScope.hotelesSeleccionados = $localStorage.hotelesSeleccionados!=null?JSON.parse($localStorage.hotelesSeleccionados):[];
		$scope.hotelid;
		$http.get("/recinto/findById/"+$scope.hotelid).success(function(hotel){
			if(hotel){
				$scope.currentHotel = hotel;
				$scope.showAddButtonCurHot = $scope.existeEnSeleccion($scope.currentHotel);
			}
		})

	};


	$scope.$evalAsync(function() {
		$log.info('HotelController.$evalAsync');
		$scope.init();
	});
});
