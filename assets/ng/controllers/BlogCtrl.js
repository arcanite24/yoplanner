angular.module('yoplanner.blog',[])
.controller('BlogCtrl',function($scope,$http,$sce,$filter,$stateParams,$state){
	
	$scope.init = function(){
		$scope.current = $state.current;
		console.log("STATE NAME >>>>>",$state.current.name)
		if($state.current.name == 'blog'){
			$http.get('https://www.googleapis.com/blogger/v3/blogs/2308029918415221280/posts?key=AIzaSyBAg_S0Hde7VaxSVp_mmEB0gOdzCCO756Y')
			.success(function(data){
				console.log("BLOG DATA >>>>> ",data.items);
				$scope.posts = data.items;
				for(var i in $scope.posts){
					var post = $scope.posts[i];
					console.log("'more'",post.content.search("<a name='more'>"))
					if(post.content.search("<a name='more'>")<0){
						post.contentText = post.content;
						post.imagen = "";
						post.limitText = $filter('limitTo')(post.contentText, 450);
						continue;
					}
					post.contentText = post.content.substr(post.content.search("<a name='more'>"))
					post.imagen = post.content.substr(0,post.content.search("<a name='more'>"))
					post.limitText = $filter('limitTo')(post.contentText, 450);
				}
			}).catch(function(err){
				console.error(err)
			})
		}else if($state.current.name == 'blogPost'){

			$scope.posts = [];
			$http.get('https://www.googleapis.com/blogger/v3/blogs/2308029918415221280/posts/'+$stateParams.id+'?key=AIzaSyBAg_S0Hde7VaxSVp_mmEB0gOdzCCO756Y')
			.success(function(data){
				$scope.posts.push(data)
				
			}).catch(function(err){
				console.error(err)
			})
		}
	}
	


	
	$scope.deliberatelyTrustDangerousSnippet = function(data) {
		return $sce.trustAsHtml(data);
	};


	$scope.init();
})