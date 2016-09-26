'use strict';
/**
 * MainController
 *
 * @description :: Server-side logic for managing Mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = {

	root: function(req, res) {
		var url = req.param('id');
		console.log("MainController", "url", url)
		if (!url || url.search(/favicon/) >= 0)
			return res.view('homepage');

			Destino.findOne({urlslug: url}).then(function(data) {
				console.log(data);
			  if (data) {
					return res.view('destino-detail', {
						destino: data
					});
			  } else {
					Ciudad.findOne({
						slug: url
					}).then(function(ciudad) {
						if (!ciudad) {
							RecintoService.findByUrlSlug(url)
								.then(function(hotel) {
									if (!hotel) {
										RecintoService.findById(url)
											.then(function(hotel) {
												var amens = "";
												hotel.amenities.forEach(function(amen) {
													amens += "Hotel con " + amen.description + ",";
												})
												res.view("hoteles/hotel-detail", {
													hotel: hotel,
													metas: {
														title: hotel.name,
														description: hotel.description,
														keywords: hotel.name + "," + amens,
														image: hotel.pictures ? hotel.pictures[0] : 'http://rfp.yoplanner.com/img/banner/banneryp.jpg'
													}
												});
											})
									} else {
										console.log("hotel", hotel.name)
										var amens = "";
										hotel.amenities.forEach(function(amen) {
											amens += "Hotel con " + amen.description + ",";
										})
										res.view("hoteles/hotel-detail", {
											hotel: hotel,
											metas: {
												title: hotel.name,
												description: hotel.description,
												keywords: hotel.name + "," + amens,
												image: hotel.pictures ? hotel.pictures[0] : 'http://rfp.yoplanner.com/img/banner/banneryp.jpg'
											}
										});
									}
								}).catch(function(err) {
									console.log(__filename, err)

								})
						} else {
							RecintoService.findByCiudadId(ciudad.id).then(function(hoteles) {
								Destino.findOne({cityId: hoteles[0].cityId}).then(function(destino) {
									console.log('CIUDAD', ciudad);
									res.view('hoteles/hoteles-list', {
										layout:"layout_old",
										hoteles: hoteles,
										ciudad: ciudad,
										destinoUrl: destino.urlslug,
										metas: {
											title: 'Hoteles en ' + ciudad.name,
											description: 'Organiza eventos en ' + ciudad.name,
											keywords: 'Hoteles en ' + ciudad.name + ',Eventos en ' + ciudad.name + ',Convenciones en ' + ciudad.name,
											image: ciudad.image
										}
									})
								}).catch(function(err) {
									console.log('CIUDAD', ciudad);
									res.view('hoteles/hoteles-list', {
										layout:"layout_old",
										hoteles: hoteles,
										ciudad: ciudad,
										destinoUrl: '',
										metas: {
											title: 'Hoteles en ' + ciudad.name,
											description: 'Organiza eventos en ' + ciudad.name,
											keywords: 'Hoteles en ' + ciudad.name + ',Eventos en ' + ciudad.name + ',Convenciones en ' + ciudad.name,
											image: ciudad.image
										}
									})
								});
							}).catch(function(err) {
								res.view('hoteles/hoteles-list', {
									layout:"layout_old",
									hoteles: [],
									ciudad: ciudad,
									destinoUrl: '',
									metas: {
										title: 'Hoteles en ' + ciudad.name,
										description: 'Organiza eventos en ' + ciudad.name,
										keywords: 'Hoteles en ' + ciudad.name + ',Eventos en ' + ciudad.name + ',Convenciones en ' + ciudad.name,
										image: ciudad.image
									}
								})
							})
						}
					})
				}
			}).catch(console.log);
	},
	redirect: function(req, res) {

		var path = req.route.path;
		if (path === "/") {
			console.log("PATH")
			res.view('homepage')
		} else {
			res.locals.metas = _SECCIONES[path];
			res.locals.path = path;
			req.session.metas = _SECCIONES[path];
			res.view("empty", {
				layout: "infoLayout"
			})
		}
	},

	serveCancun: function (req, res) {
		User.findOne({username: 'cancun@yoplanner.com'}).then(function(data) {
		  if (data) {
		  	return res.view('destino-detail', {
					destino: data
				});
		  } else {
				return res.json(500, {error: true, message: 'Error con el usuario del destino.'});
			}
		});
	}

};
