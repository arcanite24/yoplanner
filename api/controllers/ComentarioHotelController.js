/**
 * ComentarioHotelController
 *
 * @description :: Server-side logic for managing Comentariohotels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	getComentarios: function (req, res) {
		var id = req.param('id');
		var page = req.param('page');
		ComentarioHotel.count({hotel: id}).then(function (cuantos) {
			var count_comentarios = cuantos;
			ComentarioHotel.find({hotel: id}).populate('user').paginate({page: page, limit: 10}).then(function (comentarios) {
				return res.json({comentarios: comentarios, count: count_comentarios});
			}).catch(console.log);
		}).catch(console.log);
	},

	postComentario: function (req, res) {
		var comentarioParams = req.allParams();
		comentarioParams.user = req.user.id;
		ComentarioHotel.create(comentarioParams).then(function (comentario) {
			ComentarioHotel.findOne({id: comentario.id}).populate('user').then(function (comentario_final) {
				console.log('Comentario creado', comentario_final);
				return res.json({comentario: comentario_final});
			}).catch(console.log);
		}).catch(console.log);
	},

	like: function (req, res) {
		var comment = req.param('comentario');
		for (var i in comment.likes) {
			if (comment.likes[i] == req.user.id) {
				return res.json({error: true, message: 'Ya haz agradecido a este comentario.'});
			}
		}
		comment.likes.push(req.user.id);
		ComentarioHotel.update({id: comment.id}, comment).then(function (comentario) {
			console.log(comentario);
			return res.json(comentario[0]);
		}).catch(console.log);
	},

	addReply: function (req, res) {
		var id = req.param('id');
		var text = req.param('replytext');
		ComentarioHotel.findOne({id: id}).then(function (comentario) {
			var reply = {
				text: text,
				user: req.user.id,
				name: req.user.name || req.user.username,
				createdAt: new Date().toISOString()
			};
			if (!comentario.replies) {
				comentario.replies = [reply];
			} else {
				comentario.replies.push(reply);
			}
			ComentarioHotel.update({id: id}, comentario).then(function (com) {
				console.log('Anadida respuesta a comentario...');
				return res.json(com[0]);
			}).catch(console.log);
		}).catch(console.log);
	},

	deleteReply: function (req, res) {
		var id = req.param('id');
		var reply = req.param('reply');
		ComentarioHotel.findOne({id: id}).then(function (comentario) {
			for (var i = 0; i < comentario.replies.length; i++) {
				if (comentario.replies[i].user == reply.user && comentario.replies[i].text == reply.text && comentario.replies[i].createdAt == reply.createdAt) {
					comentario.replies.splice(i, 1);
					break;
				}
			}
			ComentarioHotel.update({id: id}, comentario).then(function (com) {
				console.log('Borrando respuesta...');
				return res.json(com[0]);
			}).catch(console.log);
		}).catch(console.log);
	},

	editReply: function (req, res) {
		var id = req.param('id');
		var reply = req.param('reply');
		var newtext = req.param('newtext');
		ComentarioHotel.findOne({id: id}).then(function (comentario) {
			for (var i = 0; i < comentario.replies.length; i++) {
				if (comentario.replies[i].user == reply.user && comentario.replies[i].text == reply.text && comentario.replies[i].createdAt == reply.createdAt) {
					comentario.replies[i].text = newtext;
					break;
				}
			}
			ComentarioHotel.update({id: id}, comentario).then(function (com) {
				console.log('Editando respuesta...');
				return res.json(com[0]);
			}).catch(console.log);
		}).catch(console.log);
	},

	getUser: function (req, res) {
		if (req.user) {
			return res.json(req.user);
		} else {
			return res.json({error: true, message: 'Usuario no logeado'});
		}
	},

	deleteComment: function (req, res) {
		var id = req.param('id');
		ComentarioHotel.destroy({id: id}).then(function (com) {
			return res.json(com);
		}).catch(console.log);
	},

	editComment: function (req, res) {
		var id = req.param('id');
		var newtext = req.param('newtext');
		ComentarioHotel.findOne({id: id}).then(function (comentario) {
			comentario.text = newtext;
			ComentarioHotel.update({id: id}, comentario).then(function (com) {
				return res.json(com[0]);
			}).catch(console.log);
		}).catch(console.log);;
	}

};
