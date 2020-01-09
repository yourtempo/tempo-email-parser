import linkify from './linkify';
import removeQuotations from './removeQuotations';
import removeTrailingWhitespaces from './removeTrailingWhitespaces';
import prepareMessage from './prepareMessage';

export default prepareMessage;
// For development purpose, also expose other main functions for now
export { removeQuotations, linkify, removeTrailingWhitespaces };
