$(document).ready(function() {
	var base = $('#blogURL').attr('href'),
		$firstPostLink = $('#first-post-link').attr('href'),
		$mainContent = $("#ajax-container"),
		$innerContainer = $('#content'),
		$searchInput = $("#s"),
		$allLinks = $("a"),
		$historySupported = false,
		$currentFeature = 1,
		$mouseOver = false,
		$finishedLoading = false,
		$containerHeight = $("#ajax-container").height(),
		$currentWidth = '',
		$newWidth = '',
		$isMobile = false,
		$whoYouTweetingAt = "",
		$el;
	if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry)/)) {
		$isMobile = true;
		$('html').addClass('mobile-device');
	} else {
		$isMobile = false;
		$('html').addClass('not-mobile-device');
	};

	function isiPad() {
		if (navigator.userAgent.match(/iPad/i) != null) {
			$('html').addClass('is-iPad');
		}
	}

	function debug(text) {
		if ((typeof(Debug) !== 'undefined') && Debug.writeln) {
			Debug.writeln(text);
		}
		if (window.console && window.console.log) {
			window.console.log(text);
		}
		if (window.opera) {
			window.opera.postError(text);
		}
		if (window.debugService) {
			window.debugService.trace(text);
		}
	}

	function isSupportedBrowserHistory() {
		return !!(window.history && history.pushState);
	}

	function popStateHandler(event) {
		if (event.state != null) {
			(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
			ajaxLoadContent(event.state);
		}
	}
	
	

	function init() {
		
		$(function() {
			window.history.pushState("Fuck You Congress", "Fuck You Congress", "");
	    });
		
		
	/*
		var newPath = '.post-content[data-slug="' + location.pathname.substr(1) + '"]';
			var newLink = '.post-content[data-slug="' + location.pathname.substr(1) + '"] a.random-post-link';
			console.log(newLink);
			
			var $id = $('.post-content[data-slug="' + location.pathname.substr(1) + '"]').attr("id");
			
			var $id = "#" + $id + " a.random-post-link";
			console.log($id);
			
			$(function() {
						$($id).click();
	
			    });
			
	*/
	
	
	
		
		$newHeight = $('.current-post').outerHeight();
		$('#home-page-intro-inner').css('min-height', $newHeight);
		twitterZip();
		bindHoverFx();
		fullScreenSlide();
		mediaQueryCalculator();
/*		$historySupported = isSupportedBrowserHistory();*/
		$historySupported = false;
		if ($historySupported) {
			var current = location.protocol + '//' + location.hostname + location.pathname;
			if (base + '/' != current) {
				var diff = current.replace(base, '');
				history.replaceState(diff, base + diff, diff);
			} else {
				var diff = $('#post-1').data('slug');
				history.replaceState(diff, base + diff, diff);
				$thisPost = $('.current-post .nav-below a').data('this');
				document.title = $($thisPost).data('title');
				_gaq.push(['_trackPageview']);
			}
			window.onpopstate = popStateHandler;
		} else {}
	}

	function twitterZip() {
		$("#twitter-zip-text").keyup(function(event) {
			if (event.keyCode == 13) {
				$("#twitter-zip-submit").click();
			}
		});
		$('#twitter-zip-submit').on("click", function() {
			var userInputZip = $('#twitter-zip-text').val();
			if (userInputZip.length !== 5 || !/^\d+$/.test(userInputZip)) {
				$('#twitter-subtitle').html('<span class="twitter-error">We\'re not sure what that was, but it\'s not a valid zip..</span>');
				return false;
			}
			userState = userInputZip;
			$.ajax({
				url: ("https://congress.api.sunlightfoundation.com/legislators/locate?chamber=house&zip=" + userState + "&apikey=2497ab250c7544fe9721e938bef24e59"),
				dataType: "json",
				type: "get",
				success: function(response) {
					var results;
					var senatorHandles;
					var tweetBodies = ["Yes, it's seriously this bad. You've reduced us to publicly saying #FuckYouCongress. fuckyoucongress.com"];
					var randomIndex = Math.floor(Math.random() * tweetBodies.length);
					var tweetContent = tweetBodies[randomIndex];
					var apiButtonText = "";
					var tweetURL = "";
					var apiFriendlyContent;
					var apiSafeKeepUsHereURL = "";
					if (response.count === 0) {
						$('#twitter-subtitle').html('<span class="twitter-error">We\'re not sure what that was, but it\'s not a valid zip..</span>');
						return false;
					} else {
						$('#twitter-subtitle').html("Tell the elected official from your district that you've fucking had enough.");
						results = response.results;
						$.each(results, function() {
							if (this.chamber === "house" && typeof this.twitter_id === "string") {
								tweetContent = tweetContent + " @" + this.twitter_id;
								apiButtonText = apiButtonText + " " + this.last_name + " and";
							}
						});
						apiButtonText = apiButtonText.substring(0, apiButtonText.length - 4);
						$('#twitter-zip-submit').css('display', 'none');
						$('#twitter-api-submit').fadeIn();
						$('#twitter-api-submit').text('Let ' + apiButtonText + ' Know You\'re Fed Up');
						_gaq.push(['_trackEvent', 'Find Congress twitter by Zip Code ', 'Zip Code entered', apiButtonText]);
						apiFriendlyContent = tweetContent.replace(' ', '%20').replace('#', '%23').replace('@', '%40');
						tweetURL = "http://twitter.com/share?url=http%3A%2F%2F&text=" + apiFriendlyContent;
						$('#twitter-api-submit').on("click", function() {
							window.open(tweetURL, 'Tweet @ Congress');
							_gaq.push(['_trackEvent', 'TW_at_congress', 'Tweet @ Congress button clicked', apiButtonText]);
							return false;
						});
						$('#tweet-zip-row').fadeOut(400, function() {
							$('#tweet-api-row').fadeIn();
						});
					}
				},
				error: function() {
					$('#twitter-subtitle').html('<span class="twitter-error">Sorry, there was an error. Did you enter a valid zip code?</span>');
				}
			});
			return false;
		});
	}

	function ajaxLoadContent(path) {
		$innerContainer.fadeOut();
		$('#ajax-loader').fadeIn();
		$.ajax({
			type: "GET",
			url: base + path,
			dataType: "html",
			success: function(out) {
				var result = $(out);
				var pageContent = $(out).find("#content");
				$mainContent.empty();
				$('#ajax-loader').fadeOut();
				$mainContent.append(pageContent.fadeIn());
				fullScreenSlide();
				bindHoverFx();
				$innerContainer = pageContent;
				document.title = $innerContainer.data('title');
				var classList = $innerContainer.attr('class').split(/\s+/);
				$('body').removeClass();
				$.each(classList, function(index, item) {
					$('body').addClass(item);
				});
			}
		});
	}
	$('a:urlInternal').live('click', function(event) {
		if ($historySupported) {
			$el = $(this);
			if ((!$el.hasClass("comment-reply-link")) && ($el.attr("id") != 'cancel-comment-reply-link') && (!$el.hasClass('ab-item')) && (!$el.hasClass('post-edit-link')) && (!$el.hasClass('no-ajax'))) {
				(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
				var path = $el.attr('href').replace(base, '');
				history.pushState(path, base + path, path);
				ajaxLoadContent(path);
				$(".current_page_item").removeClass("current_page_item");
				$allLinks.removeClass("current_link");
				$el.addClass("current_link").parent().addClass("current_page_item");
				_gaq.push(['_trackPageview']);
				return;
			}
		}
	});
	$('#searchform').submit(function(event) {
		if ($historySupported) {
			(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
			var s = $searchInput.val();
			if (s) {
				var path = '/?s=' + s;
				history.pushState(path, base + path, path);
				ajaxLoadContent(path);
				$(".current_page_item").removeClass("current_page_item");
				$allLinks.removeClass("current_link");
			}
			return false;
		}
	});
	$(window).resize(function() {
		fullScreenSlide();
		bindHoverFx();
		mediaQueryCalculator();
	});

	function mediaQueryCalculator() {
		var width = $(window).width();
		if (width >= 0 && width <= 479) {
			$newWidth = 'width-0-479';
		} else if (width >= 480 && width <= 767) {
			$newWidth = 'width-480-767';
		} else if (width >= 768 && width <= 1023) {
			$newWidth = 'width-768-1024';
		} else if (width >= 1024 && width <= 1199) {
			$newWidth = 'width-1024-1199';
		} else if (width >= 1200) {
			$newWidth = 'width-1200';
		}
		$('body').removeClass($currentWidth).addClass($newWidth);
		$currentWidth = $newWidth;
	}

	function bindHoverFx() {
		$('#facebook-share').unbind('click');
		$('#facebook-share').click(function() {
			var $linkTitle = $(this).attr('title');
			_gaq.push(['_trackEvent', 'FB_share_clicked', 'Facebook share clicked', $linkTitle]);
		});
		$('#twitter-share').unbind('click');
		$('#twitter-share').click(function() {
			var $linkTitle = $(this).attr('title');
			_gaq.push(['_trackEvent', 'TW_share_clicked', 'Twitter share clicked', $linkTitle]);
		});
		$('.logo-container a').unbind('click');
		$('.logo-container a').click(function() {
			var $linkTitle = $(this).attr('title');
			_gaq.push(['_trackEvent', 'Organizations making a difference link', '' + $linkTitle + ' clicked', $linkTitle]);
		});
		$('#random-post-link').unbind('click');
		$('#random-post-link').click(function() {
			var $linkTitle = $(this).attr('title');
			_gaq.push(['_trackEvent', 'There\'s Fucking More link', '' + $linkTitle + ' clicked', $linkTitle]);
		});
		$('#random-post-logo-link').unbind('click');
		$('#random-post-logo-link').click(function() {
			$('.current-post a.random-post-link').click();
		});
		$('a.random-post-link').unbind('click');
		$('a.random-post-link').click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			var $linkTitle = $(this).attr('title');
			_gaq.push(['_trackEvent', 'There\'s Fucking More link', '' + $linkTitle + ' clicked', $linkTitle]);
			$currentPost = $(this).data('this');
			$nextPost = $(this).data('next');
			$($currentPost).fadeOut("slow", function() {
				$newHeight = $($nextPost).outerHeight();
				$('#home-page-intro-inner').css('min-height', $newHeight);
				$($currentPost).removeClass('current-post');
				$($nextPost).addClass('current-post');
				$($nextPost).fadeIn();
			});
			document.title = $($nextPost).data('title');
			var $path = $($nextPost).data('slug');
			/*
			if ($historySupported) {
							history.pushState($path, base + $path, base + '/' + $path);
							_gaq.push(['_trackPageview']);
						} else {
							$url = '"' + base + '/' + $path + '"';
							window.location = $url;
						}*/
			
		});
	}

	function fullScreenSlide() {
		var browserheight = $(window).height();
		var browserWidth = $(window).width();
		var halfWidth = browserWidth / 2;
		var threeQuarterWidth = browserWidth * .75;
		if (!$isMobile) {
			$newHeight = browserheight;
			$('.fillscreen-section').css('min-height', $newHeight);
			$('body').addClass('fullscreen-sections');
			$('body').addClass('imagesloaded');
			$(".fill-browser-inner").each(function() {
				var $thisinner = $(this).outerHeight();
				var $headerImage = $('#header-container');
				var $extraspace = (($newHeight - $thisinner - $headerImage) / 2);
				if ($extraspace > 0) {
					$(this).css('margin-top', $extraspace);
				} else {
					$(this).css('margin-top', '0px');
					$(this).css('padding-bottom', '160px');
					$('.not-mobile-device body').css('font-size', '40px');
					$('.header-image-container').css('margin-bottom', '50px');
				}
			});
		}
	}

	function fixPlaceholders() {
		$('input.wpcf7-text, textarea ').focus(function() {
			if (!$(this).data('originalValue')) {
				$(this).data('originalValue', $(this).val());
			}
			if ($(this).val() == $(this).data('originalValue')) {
				$(this).val('');
			}
		}).blur(function() {
			if ($(this).val() == '') {
				$(this).val($(this).data('originalValue'));
			}
		});
		$('#mc_mv_EMAIL').val('Email Address');
		$('#mc_mv_EMAIL').focus(function() {
			if (!$(this).data('originalValue')) {
				$(this).data('originalValue', $(this).val());
			}
			if ($(this).val() == $(this).data('originalValue')) {
				$(this).val('');
			}
		}).blur(function() {
			if ($(this).val() == '') {
				$(this).val($(this).data('originalValue'));
			}
		});
	}
	fixPlaceholders();
	init();
});
