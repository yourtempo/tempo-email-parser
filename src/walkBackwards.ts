/**
 * Walk a CheerioElement hierarchy, depth-first and in reverse order.
 * Uses generators, so that it can be used in a for loop
 */
function* walkBackwards(el: CheerioElement): Generator<CheerioElement> {
	if (!el) {
		return;
	}
	if (el.children && el.children.length > 0) {
		for (let i = el.children.length - 1; i >= 0; i--) {
			yield* walkBackwards(el.children[i]);
		}
	}
	yield el;
	return;
}

export default walkBackwards;
