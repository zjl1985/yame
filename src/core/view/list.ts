/**
 * Common Tags module, which provides views, which do not require any specific
 * HTML layout, i.e. views for <a>, <img>, <ul>, etc.
 */

import {View} from './abstract';

import Backbone = require('backbone');
import _ = require('underscore');

/**
 * A list item with the `li` tag.
 */
class ListItem extends View {
    constructor(options = {}) {
        super(_.extend({
            className: 'item'
        }, options));
    }
}


/**
 * Abstract HTML list without any specific tag name.
 */
export class List extends View {

    constructor(options = {}) {
        super(_.extend({
            className: 'ui list'
        }, options));
    }

    /**
     * Wraps a list item view around the given view.
     * @inheritdoc
     * @override
     */
    add(view: View): View {
        var item = new ListItem();
        item.add(view);
        super.add(item);
        return this;
    }

    /**
     * Listens for a click event on its child elements
     * @returns {Backbone.EventsHash}
     */
    events(): Backbone.EventsHash {
        return <Backbone.EventsHash> {
            'click .item': ev => {
                var sub = _.find(this.views, view => view.el == ev.currentTarget);
                if (sub)
                    sub.trigger('click', ev);
                this.trigger('click', sub, ev);
            }
        };
    }
}
