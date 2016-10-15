import {View} from './abstract';
import {EventBus} from '../eventbus';

import _ = require('underscore');

/**
 * Abstract class for binding a view to an EventBus instance.
 */
export abstract class Bindable extends View {

    protected bindings: { [key:string]: EventBus; };

    /** @type {string[]} List of events to listen for in a two way bound. */
    protected twoWayEvents: string[];

    /***/
    protected twoWays : string[];

    /** @type {string} Event name for a value change */
    protected eventName: string;

    /** @type {string} Delimitter between event and attribute name. */
    protected eventDelimitter: string;

    /**
     * Mapping function used when reading the value of the bound instance.
     *
     * @private
     * @type {Function}
     * @memberOf Bindable
     */
    private _mapFrom: Function;

    /**
     * Mapping function used for a two way binding.
     *
     * @private
     * @type {Function}
     */
    private _mapTo: Function;

    constructor(options: any  = { }) {
        super(options);
        this.twoWayEvents = ['keyup', 'keydown', 'change', 'blur', 'mousewheel'];
        this.eventName = 'change';
        this.eventDelimitter = ':';
        this.twoWays = [];
        this.bindings = { };
    }

    /**
     * Sets the element value of this view.
     * Override this method if your element does not support JQuery#val.
     * @param  {any} val
     * @returns {void}
     */
    set val(val: any) {
        this.$el.val(val);
    }

    /**
     * @returns {any} The value of this element.
     * Used when setting the value of the currently bound instances.
     */
    get val(): any {
        return this.$el.val();
    }

    set mapFrom(fn: Function) {
        if (this._mapFrom != fn) {
            let prev = this._mapFrom;
            this._mapFrom = fn;
            this.getValue();
            this.trigger('change:mapFrom', this._mapFrom, prev);
        }
    }

    get mapFrom(): Function {
        return this._mapFrom;
    }

    set mapTo(fn: Function) {
        if (this._mapTo != fn) {
            let prev = this._mapTo;
            this._mapTo = fn;
            this.applyValue();
            this.trigger('change:mapFrom', this._mapTo, prev);
        }
    }

    /**
     * The mapTo function used for a two way binding.
     * @type {Function}
     */
    get mapTo(): Function {
        return this._mapTo;
    }

    /**
     * Binds this view to the given EventBus instance, i.e. if the given
     * attribute changes in the instance, this view will make sure that it
     * updates properly with the new value.
     * @param  {EventBus} instance
     * @param  {string}   attribute The attribute to watch.
     * @param  {boolean}  twoWay    If this flag is set to `true`, the view will
     *                              also update the editable's attribute.
     * @chainable
     */
    bindTo(instance: EventBus, attribute: string, twoWay: boolean = false): View {
        this.bindings[attribute] = instance;
        instance.on(`${this.eventName}${this.eventDelimitter}${attribute}`, val => this.getValue(attribute, val), this);
        if (twoWay && this.twoWays.indexOf(attribute) < 0) {
            // Push the attribute instance combination to
            this.twoWays.push(attribute);
            this.delegateEvents();
        }
        this.getValue(attribute);
        return this;
    }

    /**
     * Unbinds this view from the given EventBus instance.
     * @param  {EventBus} instance
     * @param  {string}   attribute Optional attribute to unbind this view from.
     *                              Leave this empty to unbind this view from
     *                              all attribute events.
     * @chainable
     */
    unbindFrom(instance: EventBus, attribute: string = null): View {
        if (attribute) {
            instance.off(`${this.eventName}${this.eventDelimitter}${attribute}`, null, this);
            delete this.twoWays[attribute];
        } else {
            instance.off(null, null, this);
            _.each(this.twoWays, (instance, attribute) => delete this.twoWays[attribute]);
        }
        this.delegateEvents();
        return this;
    }

    /**
     * Gets the vaue of the currently bound instance.
     *
     * @param {string} [attribute]
     * @param {*} [val]
     */
    getValue(attribute?: string, val?: any) {
        _.each(this.bindings, (instance, attr) => {
            if (attribute && attribute != attr) return;
            let prevVal = this.val;
            if (val == void 0) {
                var subs = attr.split('.');
                var last = subs[subs.length-1];
                var obj = instance;
                subs.forEach((sub, i) => {
                    if (i < subs.length - 1)
                        obj = obj[sub];
                });
                val = obj[last];
            }
            let newVal = val;
            if (this._mapFrom) newVal = this._mapFrom(val);
            if (prevVal != newVal) this.val = newVal;
        });
    }

    /**
     * Applies the current value of this view to all bound instances.
     * @returns {void}
     */
    protected applyValue() {
        _.each(this.bindings, (instance: EventBus, attribute: string) => {
            if (this.twoWays.indexOf(attribute) < 0) return;
            var subs = attribute.split('.');
            var last = subs[subs.length-1];
            var obj = instance;
            subs.forEach((sub, i) => {
                if (i < subs.length - 1)
                    obj = obj[sub];
            });
            if (this._mapTo) obj[last] = this._mapTo(this.val);
            else obj[last] = this.val;
        });
    }

    /** @inheritdoc */
    events(): Backbone.EventsHash {
        let events = {};
        // Do this check since this method gets called before the property exists
        if (this.twoWayEvents)
            this.twoWayEvents.forEach((name: string) => events[name] = this.applyValue);
        return <Backbone.EventsHash> events;
   }
}
