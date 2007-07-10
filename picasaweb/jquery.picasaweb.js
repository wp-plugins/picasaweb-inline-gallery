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
	
	//  72,144,288,576,640
	options: {width_m: "288", width_s: "144"},
	
	init: function(rule, options) {
		
		if (options) jQuery.extend(jQuery.picasaweb.options, options);
		
		var rule = rule || "a";
		$(rule).each( 
			function() {
				if (this.picasaWasHere) return;
				var h = this.href, re = /^http:\/\/picasaweb.google.([a-z\.]+)\/(.*)$/i, m = h.match(re), ga;
				if (m) {
					ga = m[2].split('/');
					this.picasaGallery = ga[0];
					this.picasaAlbum = ga[1];
					this.picasaDomain = m[1];
					this.picasaId = this.picasaAlbum + "_" + jQuery.picasaweb._static++;
					jQuery.picasaweb.cache[h] = this;
					jQuery.picasaweb.picasaCall.apply(this);
				}
				this.picasaWasHere = true;
			}
		);
	},
	
	picasaCall: function() {
		var call = "http://picasaweb.google."+this.picasaDomain+"/data/feed/api/user/" + this.picasaGallery;
		if (this.picasaAlbum) call = call + "/album/" + this.picasaAlbum;
			else return; // Return for now. Later will grab an albums also
		var a = this;
		window['_f_'+a.picasaId] = function(data) {
			$.picasaweb.picasaAlbum(data, a);
		}
		call = call + "?alt=json-in-script&callback=" + '_f_'+a.picasaId;
		document.open();
		document.write('<scrip'+'t src="'+call+'" charset="utf-8"></s'+'cript>');
		document.close();
	},
	
	_getAlternate: function(a) {
		return $.grep(a, function(n,i) {return n.rel=="alternate"})[0].href;
	},
	
	picasaAlbum: function(json, link) {
		var data = json.feed, i, a;
		a = link || false;
		if (!a) {
			for (i=0; i<data.link.length; i++) {
				if (data.link[i].rel == "alternate") {
					a = jQuery.picasaweb.cache[data.link[i].href];
				}
			}
		}
		if (!a) return;
		
		var u = [], e = data.entry || [], t;
		
		for (i=0; i<e.length; i++) {
			t = e[i].summary["$t"] || e[i].title["$t"];
			u.push('<li><a href="'+e[i]["media$group"]["media$content"][0]["url"]+'?imgmax='+jQuery.picasaweb.options.width_m+'" rel="'+jQuery.picasaweb._getAlternate(e[i].link)+'" id="'+e[i].id["$t"]+'" title="'+t+'"><img src="'+e[i]["media$group"]["media$content"][0]["url"]+'?imgmax='+jQuery.picasaweb.options.width_s+'" border="0" /></a></li>');
		}
		t = e[0].summary["$t"] || e[0].title["$t"];
			
		$(a).after('<div class="picasa-album" id="picasa-album-'+a.picasaId+'"><h2><a href="'+a.href+'">'+data.title["$t"]+'</a></h2><div class="picasa-description">'+data.subtitle["$t"]+'</div><div class="picasa-preview"><a target="_blank" href="'+jQuery.picasaweb._getAlternate(e[0].link)+'"><img style="display: none;" src="'+e[0]["media$group"]["media$content"][0]["url"]+'?imgmax='+jQuery.picasaweb.options.width_m+'" border="0" /></a><div class="picasa-photo-summary">'+t+'</div><div id="picasa-loader" style="position: relative;"></div></div><ul class="picasa-photos">'+u.join("")+'</ul><div>');
		$(a).hide();
		$("#picasa-album-"+a.picasaId+" .picasa-photos a").click(function(event) {
			event.stopPropagation();
			event.preventDefault();
			$("#picasa-album-"+a.picasaId+" #picasa-loader").height($("#picasa-album-"+a.picasaId+" .picasa-preview a img").height());
			$("#picasa-album-"+a.picasaId+" #picasa-loader").width($("#picasa-album-"+a.picasaId+" .picasa-preview a img").width());
			$("#picasa-album-"+a.picasaId+" #picasa-loader").show();
			$("#picasa-album-"+a.picasaId+" .picasa-photo-summary").html(this.title);
			
			$("#picasa-album-"+a.picasaId+" .picasa-preview a img").hide();
			$("#picasa-album-"+a.picasaId+" .picasa-preview a").attr("href", this.rel);
			$("#picasa-album-"+a.picasaId+" .picasa-preview a img").attr("src", this.href);
		});
		$("#picasa-album-"+a.picasaId+" .picasa-preview a img").bind("load", function() {$("#picasa-album-"+a.picasaId+" #picasa-loader").hide(); $("#picasa-album-"+a.picasaId+" .picasa-preview a img").show();});
	}
}