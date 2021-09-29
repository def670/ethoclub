/**
 * @module ember-paper-tabs
 * @public
 */
import Component from 'ember-component';
import { ChildMixin } from 'ember-composability-tools';
import layout from '../../templates/components/paper-tabs/content-wrapper';

/**
 * @class PaperTabsContentWrapper
 * @extends Component
 * @uses ChildMixin
 * @public
 */
export default Component.extend(ChildMixin, {

  tagName: 'md-tabs-content-wrapper',

  layout

});
