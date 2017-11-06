import 'whatwg-fetch';
import _ from 'underscore';

import config from './../config';

export default class ImageListCollection {
	constructor(onComplete, onFail) {
		this.url = config.apiUrl+config.endpoints.documents;
		this.lastUrl = '';

		this.onComplete = onComplete;
		this.onFail = onFail;

		this.loading = false;
	}

	fetch(params, count, page, append, archiveMaterial) {
		page = page || 1;

		this.currentPage = page;

		params = params || {};

		var previousParams = this.currentParams;
		this.currentParams = params;

		if (!((this.url && !this.loading) || append)) {
//			console.log('JSON.stringify(previousParams) == JSON.stringify(params) : '+(JSON.stringify(previousParams) == JSON.stringify(params)));
		}

//		if ((JSON.stringify(previousParams) != JSON.stringify(params) && this.url && !this.loading) || append) {
		if (!this.loading) {
			this.loading = true;

			var fetchParams = [];
			if (params.searchString) {
				fetchParams.push('search='+params.searchString);
			}
			if (params.person && params.person != '') {
				fetchParams.push('person='+(params.person.join ? params.person.join(';') : params.person));
			}
			if (params.place && params.place != '') {
				fetchParams.push('place='+params.place);
			}
			if (params.museum && params.museum != '') {
				fetchParams.push('museum='+params.museum);
			}
			if (params.genre && params.genre != '') {
				fetchParams.push('genre='+params.genre);
			}
			if (params.tags && params.tags != '') {
				fetchParams.push('tags='+params.tags);
			}
			if (params.type && params.type != '') {
				fetchParams.push('type='+params.type);
			}
			if (params.hue && params.hue != '') {
				fetchParams.push('hue='+params.hue);
			}
			if (params.saturation && params.saturation != '') {
				fetchParams.push('saturation='+params.saturation);
			}
			if (count) {
				fetchParams.push('count='+count);
			}

			if (params.hue || params.saturation) {
				fetchParams.push('archivematerial=exclude');
			}
			else if (archiveMaterial || params.hue || params.saturation) {
				fetchParams.push('archivematerial='+archiveMaterial);
			}

			console.log('wildcardSearch: '+window.wildcardSearch);
			if (window.wildcardSearch) {
				fetchParams.push('wildcard=true');
			}
			console.log('generousSearch: '+window.generousSearch);
			if (window.generousSearch) {
				fetchParams.push('generous=true');
			}

			fetchParams.push('page='+page);

			var url = this.url+(fetchParams.length > 0 ? '?'+fetchParams.join('&') : '');

			if (this.lastUrl == url) {
				if (this.onFail) {
					this.onFail();
				}

				return;
			}

			this.lastUrl = url;

			fetch(url)
				.then(function(response) {
					return response.json();
				}).then(function(json) {
					this.loading = false;
					if (this.onComplete) {
						this.onComplete({
							append: append,
							data: json
						});
					}
				}.bind(this)).catch(function(ex) {
					console.log('parsing failed', ex)
				})
			;
		}
		else {
			if (this.onFail) {
				this.onFail();
			}
		}
	}
}