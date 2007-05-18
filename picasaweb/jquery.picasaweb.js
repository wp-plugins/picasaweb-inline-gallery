/**
* jQuery plugin 
* Picasa Web Albums inline integration
*
* by Eugene Bond <eugene.bond@gmail.com>
* http://bondariev.info/category/web/picasaweb/
*/
jQuery.picasaweb = {
	_static: 1,
	
	cache: {},
	
	init: function(rule) {
		
		var rule = rule || "a";
		$(rule).each( 
			function() {
				if (this.picasaWasHere) return;
				var h = this.href, re = /^http:\/\/picasaweb.google.com\/(.*)$/i, m = h.match(re), ga;
				if (m) {
					ga = m[1].split('/');
					this.picasaGallery = ga[0];
					this.picasaAlbum = ga[1];
					this.picasaId = this.picasaAlbum + "-" + jQuery.picasaweb._static++;
					jQuery.picasaweb.cache[h] = this;
					jQuery.picasaweb.picasaCall.apply(this);
				}
				this.picasaWasHere = true;
			}
		);
	},
	
	picasaCall: function() {
		var call = "http://picasaweb.google.com/data/feed/api/user/" + this.picasaGallery;
		if (this.picasaAlbum) call = call + "/album/" + this.picasaAlbum;
			else return; // Return for now. Later will grab an albums also
		call = call + "?alt=json-in-script&callback=" + (this.picasaAlbum ? "$.picasaweb.picasaAlbum" : "$.picasaweb.picasaGallery");
		if ($.browser.msie) {
			this.document.write('<scrip'+'t src="'+call+'"></s'+'cript>');
		} else {
			$("body").append('<script src="'+call+'"></script>');
		}
	},
	
	_getAlternate: function(a) {
		return $.grep(a, function(n,i) {return n.rel=="alternate"})[0].href;
	},
	
	picasaAlbum: function(json) {
		var data = json.feed, i, a;
		
		for (i=0; i<data.link.length; i++) {
			if (data.link[i].rel == "alternate") {
				a = jQuery.picasaweb.cache[data.link[i].href];
			}
		}
		if (!a) return;
		
		var u = [], e = data.entry || [];
		
		for (i=0; i<e.length; i++) {
			
			u.push('<li><a href="'+e[i]["media$group"]["media$thumbnail"][1]["url"]+'" rel="'+jQuery.picasaweb._getAlternate(e[i].link)+'" id="'+e[i].id["$t"]+'" title="'+e[i].title["$t"]+'"><img src="'+e[i]["media$group"]["media$thumbnail"][0]["url"]+'" border="0" width="'+e[i]["media$group"]["media$thumbnail"][0]["width"]+'" height="'+e[i]["media$group"]["media$thumbnail"][0]["height"]+'" /></a></li>');
		}
		
		$(a).after('<div class="picasa-album" id="picasa-album-'+a.picasaId+'"><h2><a href="'+a.href+'">'+data.title["$t"]+'</a></h2><div class="picasa-descaription">'+data.subtitle["$t"]+'</div><div class="picasa-preview"><a target="_blank" href="'+jQuery.picasaweb._getAlternate(e[0].link)+'"><img style="display: none;" src="'+e[0]["media$group"]["media$thumbnail"][1]["url"]+'" border="0" /></a><div id="picasa-loader" style="position: relative;"></div></div><ul class="picasa-photos">'+u.join("")+'</ul><div>');
		$(a).hide();
		$("#picasa-album-"+a.picasaId+" .picasa-photos a").click(function(event) {
			event.stopPropagation();
			event.preventDefault();
			$("#picasa-album-"+a.picasaId+" #picasa-loader").height($("#picasa-album-"+a.picasaId+" .picasa-preview a img").height());
			$("#picasa-album-"+a.picasaId+" #picasa-loader").width($("#picasa-album-"+a.picasaId+" .picasa-preview a img").width());
			$("#picasa-album-"+a.picasaId+" #picasa-loader").show();
			
			$("#picasa-album-"+a.picasaId+" .picasa-preview a img").hide();
			$("#picasa-album-"+a.picasaId+" .picasa-preview a").attr("href", this.rel);
			$("#picasa-album-"+a.picasaId+" .picasa-preview a img").attr("src", this.href);
		});
		$("#picasa-album-"+a.picasaId+" .picasa-preview a img").bind("load", function() {$("#picasa-album-"+a.picasaId+" #picasa-loader").hide(); $("#picasa-album-"+a.picasaId+" .picasa-preview a img").show();});
	}
}