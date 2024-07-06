export interface BoundingRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

export interface Metadata {
	type?: string;
	anchor?: Block;
	top: number;
	left: number;
	width: number;
	height: number;
}

export class Block implements Metadata {
	lines: string[];

	// Metadata
	type?: string;
	anchor?: Block;
	top: number;
	left: number;
	width: number;
	height: number;

	constructor(lines: string[], metadata: Metadata) {
		this.lines = lines;

		this.type = metadata.type;
		this.anchor = metadata.anchor;
		this.top = metadata.top;
		this.left = metadata.left;
		this.width = metadata.width;
		this.height = metadata.height;
	}

	/**
	 * Creates empty {@linkcode Block} with given {@linkcode metadata}.
	 *
	 * @param [fillHeight=false] Whether to fill {@linkcode Block.lines} with {@linkcode Metadata.height} empty strings
	 *
	 * @example
	 * ```ts
	 * const block = Block.from({ ..., height: 5, width: 5 });
	 * console.log(block.lines); // [];
	 *
	 * const block = Block.from({ ..., height: 5, width: 5 }, true);
	 * console.log(block.lines); // ["", "", "", "", ""];
	 * ```
	 */
	static from(metadata: Partial<Metadata>, fillHeight = false): Block {
		const lines: string[] = [];
		if (fillHeight && metadata.height) {
			for (let i = 0; i < metadata.height; ++i) lines.push("");
		}
		return new Block(lines, {
			top: 0,
			left: 0,
			width: 0,
			height: 0,
			...metadata,
		});
	}

	/**
	 * Converts {@linkcode Block} to string.\
	 * It joins {@linkcode Block.lines} with given {@linkcode delimiter}.
	 */
	toString(delimiter = "\n"): string {
		return this.lines.join(delimiter);
	}

	/**
	 * Returns {@linkcode BoundingRect} of the {@linkcode Block}.\
	 * It takes positioning of all of its ancestors into account.
	 */
	boundingRect(): BoundingRect {
		let top = this.top;
		let left = this.left;

		let anchor = this.anchor;
		while (anchor) {
			top += anchor.top;
			left += anchor.left;

			anchor = anchor.anchor;
		}

		return { top, left, width: this.width, height: this.height };
	}
}
