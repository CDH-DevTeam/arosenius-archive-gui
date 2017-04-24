import React from 'react';
import 'whatwg-fetch';
import _ from 'underscore';
import Masonry  from 'react-masonry-component';

import ImageListCollection from '../collections/ImageListCollection';
import ImageListItem from './ImageListItem';

import WindowScroll from './../utils/window-scroll';

export default class ImageList extends React.Component {
	constructor(props) {
		super(props);

		this.imageLoadedHandler = this.imageLoadedHandler.bind(this);

		this.state = {
			images: [],
			initialized: false,
			columns: false
		};

		this.collection = new ImageListCollection('http://cdh-vir-1.it.gu.se:8004/documents', function(json) {
			this.setState({
				images: _.filter(json.documents, function(document) {
					return (document.image && document.image != '') || (document.images && document.images.length > 0 && document.images[0].image != '');
				})
			})
		}.bind(this));
	}

	componentWillReceiveProps(props) {
		if (!props.searchString && !props.searchPerson && !props.searchPlace && !props.searchMuseum && !props.searchGenre && !props.searchHue && !props.searchSaturation && this.state.images.length == 0) {
			this.collection.fetch();
		}
		else if (this.props.searchString != props.searchString || 
			this.props.searchPerson != props.searchPerson || 
			this.props.searchPlace != props.searchPlace || 
			this.props.searchMuseum != props.searchMuseum ||
			this.props.searchGenre != props.searchGenre ||
			this.props.searchHue != props.searchHue ||
			this.props.searchSaturation != props.searchSaturation
		) {
			this.collection.fetch(props.searchString, props.searchPerson, props.searchPlace, props.searchMuseum, props.searchGenre, props.searchHue, props.searchSaturation);

			(new WindowScroll()).scrollToY(document.documentElement.clientHeight+200, 1000, 'easeInOutSine');
		}
	}

	imageLoadedHandler() {
		setTimeout(function() {
			if (!this.state.initialized) {
				this.setState({
					initialized: true
				});
			}
		}.bind(this), 200);
	}

	render() {
		var items = _.map(this.state.images, function(image, index) {
			return <ImageListItem key={image.id} image={image} index={index} />;
		});
		items.push(<div key="grid-sizer" className="grid-sizer"/>);

		var masonryOptions = {
			columnWidth: '.grid-sizer',
			percentPosition: true,
			transitionDuration: 0
		};

		if (this.props.columns || this.state.columns) {
			return <div className="grid grid-columns initialized">
				{items}
			</div>;
		}
		else {
			return <Masonry
					className={'grid'+(this.state.initialized ? ' initialized' : '')} // default ''
					options={masonryOptions} // default {}
					disableImagesLoaded={false} // default false
					updateOnEachImageLoad={true} // default false and works only if disableImagesLoaded is false
					onImagesLoaded={this.imageLoadedHandler}
				>
				{items}
			</Masonry>;
		}
	}
}