export class CircularBuffer<T> {
	
	protected firstIndex: number;
	
	protected elementCount: number;
	
	protected capacity: number;
	
	protected buffer: Array<T | undefined>;
	
	protected allowOverwrite: boolean;
	
	protected allowOverremove: boolean;
	
	/**
	 * 
	 * @param {number} capacity
	 * @param allowOverwrite
	 * @param allowOverremove
	 */
	public constructor(capacity: number, allowOverwrite: boolean = false,
					   allowOverremove: boolean = false) {
		
		this.firstIndex = 0;
		this.elementCount = 0;
		this.capacity = capacity;
		this.buffer = [];
		this.allowOverwrite = allowOverwrite;
		this.allowOverremove = allowOverremove;
		
	}
	
	/**
	 * Wraps/normalizes the provided index to be within the interval
	 * (0, capacity] (i.e. 0 <= index < capacity).
	 * 
	 * @param {number} index The index to wrap/normalize.
	 * @returns {number} A wrapped/normalized version of the provided index,
	 * occurring on the interval (0, capacity] (i.e. 0 <= index < capacity).
	 */
	protected wrapIndex(index: number): number {
		
		return ((index % this.capacity) + this.capacity) % this.capacity;
		
	}
	
	/**
	 * Checks that the provided insertion size can be supported by the current
	 * state of the internal data structures.
	 *
	 * @param {number} insertionSize The theoretical number of elements being
	 * inserted.
	 * @throws {Error} An exception thrown if the specified insertion size
	 * cannot be supported by the current state of the internal data structures.
	 */
	protected checkInsertionLimitations(insertionSize: number): void {
	
		if (!this.allowOverwrite && (insertionSize > this.freeSpace())) {
	
			throw new Error(
				"Attempted to insert more elements into a CircularBuffer " +
				"than the structure had space for! Either ensure that the " +
				"number of inserted rows does not exceed " +
				"cirularBuffer.freeSpace() or enable allowOverwrite " +
				"when initializing your CircularBuffer to allow for " +
				"automatically overwriting elements rather than showing " +
				"this message."
			);
		
		}
	
	}
	
	/**
	 * Checks that the provided removal size can be supported by the current
	 * state of the internal data structures.
	 *
	 * @param {number} removalSize The theoretical number of elements being
	 * removed/taken.
	 * @throws {Error} An exception thrown if the specified removal size cannot
	 * be supported by the current state of the internal data structures.
	 */
	protected checkRemovalLimitations(removalSize: number): void {
		
		if (!this.allowOverremove && (removalSize > this.elementCount)) {
			
			throw new Error(
				"Attempted to remove/take more elements from a " +
				"CircularBuffer than the structure contained! Either ensure " +
				"that the number of rows to be removed/taken does not exceed " +
				"circularBuffer.size() or enable allowOverremove when " +
				"initializing your CircularBuffer to allow for instead " +
				"returning undefined from methods that would otherwise throw " +
				"this error on 'over-removal'."
			);
			
		}
		
	}
	
	/**
	 * Returns true if the index of the first element occurs later than the
	 * index of the last element in the internal array.
	 *
	 * This additionally indicates that the populated portion of the internal
	 * array spans over the 'break' in the internal array.
	 *
	 * @returns {boolean} true if the index of the first element occurs later
	 * than the index of the last element in the internal array.
	 */
	protected arePointersReversed(): boolean {
		
		return this.firstIndex > this.wrapIndex(this.getEndIndex() - 1);
		
	}
	
	/**
	 * Returns the index of the last element in the internal buffer.
	 *
	 * @returns {number} The index of the last element in the internal buffer.
	 */
	protected getEndIndex(): number {
		
		return this.wrapIndex(this.firstIndex + this.elementCount);
		
	}
	
	/**
	 * Returns the capacity of this CircularBuffer.
	 *
	 * @returns {number} The capacity of this CircularBuffer.
	 */
	public getCapacity(): number {
		
		return this.capacity;
		
	}
	
	/**
	 * Returns a count of the total number of elements occupying this
	 * CircularBuffer.
	 *
	 * @returns {number} A count of the total number of elements occupying this
	 * CircularBuffer.
	 */
	public size(): number {
		
		return this.elementCount;
		
	}
	
	/**
	 * Returns true if this CircularBuffer is empty.
	 *
	 * @returns {boolean} true if this CircularBuffer is empty.
	 */
	public isEmpty(): boolean {
		
		return this.size() === 0;
		
	}
	
	/**
	 * Returns true if this CircularBuffer is full.
	 *
	 * @returns {boolean} true if this CircularBuffer is full.
	 */
	public isFull(): boolean {
		
		return this.size() >= this.getCapacity();
		
	}
	
	/**
	 * Returns an integer count of the number of 'free spaces' occurring within
	 * this CircularBuffer.
	 *
	 * @returns {number} An integer count of the number of 'free spaces'
	 * occurring within this CircularBuffer.
	 */
	public freeSpace(): number {
		
		return this.getCapacity() - this.size();
		
	}
	
	/**
	 * Inserts the provided elements at the beginning of this CircularBuffer,
	 * and returns the new size of this CircularBuffer.
	 *
	 * @param {T[]} elements A list of elements to enqueue into this
	 * CircularBuffer.
	 * @returns {number} The new size of this CircularBuffer.
	 * @throws {Error} An exception thrown if the specified insertion size
	 * cannot be supported by the current state of the internal data structures.
	 */
	public enqueue(...elements: T[]): number {
		
		this.checkInsertionLimitations(elements.length);
		
		if (this.allowOverwrite) elements = elements.slice(-this.getCapacity());
		
		for (const element of elements) {
			
			const wasFull: boolean = this.isFull();
			const newFirstIndex: number = this.wrapIndex(this.firstIndex - 1);
			
			this.buffer[newFirstIndex] = element;
			this.firstIndex = newFirstIndex;
			
			if (!wasFull) this.elementCount++;
			
		}
		
		return this.size();
		
	}
	
	/**
	 * Inserts the provided elements at the end of this CircularBuffer, and
	 * returns the new size of this CircularBuffer.
	 *
	 * @param {T[]} elements A list of elements to push onto this
	 * CircularBuffer.
	 * @returns {number} The new size of this CircularBuffer.
	 * @throws Exception An exception thrown if the specified insertion size
	 * cannot be supported by the current state of the internal data structures.
	 */
	public push(...elements: T[]): number {
		
		this.checkInsertionLimitations(elements.length);
		
		if (this.allowOverwrite) elements = elements.slice(-this.getCapacity());
		
		for (const element of elements) {
			
			const wasFull: boolean = this.isFull();
			
			this.buffer[this.getEndIndex()] = element;
			
			if (!wasFull) this.elementCount++;
			else this.firstIndex = this.wrapIndex(this.firstIndex + 1);
			
		}
		
		return this.size();
		
	}
	
	/**
	 * Removes and returns the first element in this CircularBuffer, or
	 * undefined if allowOverremove is true and there are no elements left to
	 * remove.
	 *
	 * @returns {T | undefined} The first element in this CircularBuffer, having
	 * been removed from the CircularBuffer, or undefined if allowOverremove is
	 * true and there are no elements left to remove.
	 * @throws {Error} An exception thrown if there are no elements in this
	 * CircularBuffer to remove and return, and allowOverremove is false.
	 */
	public shift(): T | undefined {
		
		if (this.isEmpty() && this.allowOverremove) return undefined;
		else this.checkRemovalLimitations(1);
		
		const result: T = this.buffer[this.firstIndex] as T;
		
		this.buffer[this.firstIndex] = undefined;
		this.firstIndex = this.wrapIndex(this.firstIndex + 1);
		this.elementCount--;
		
		return result;
		
	}
	
	/**
	 * Removes and returns the last element in this CircularBuffer, or undefined
	 * if allowOverremove is true and there are no elements left to remove.
	 *
	 * @returns {T | undefined} The last element in this CircularBuffer, having
	 * been removed from the CircularBuffer, or undefined if allowOverremove is
	 * true and there are no elements left to remove.
	 * @throws {Error} An exception thrown if there are no elements in this
	 * CircularBuffer to remove and return, and allowOverremove is false.
	 */
	public dequeue(): T | undefined {
		
		if (this.isEmpty() && this.allowOverremove) return undefined;
		else this.checkRemovalLimitations(1);
		
		const resultIndex: number = this.wrapIndex(this.getEndIndex() - 1);
		const result: T = this.buffer[resultIndex] as T;
		
		this.buffer[resultIndex] = undefined;
		this.elementCount--;
		
		return result;
		
	}
	
	/**
	 * Alias for {@link CircularBuffer#dequeue}.
	 */
	public pop(): T | undefined {
		
		return this.dequeue();
		
	}
	
	/**
	 * Converts the contents of this CircularBuffer into an array and returns
	 * the result.
	 *
	 * @returns {T[]} The contents of this CircularBuffer, having been converted
	 * to an array.
	 */
	public toArray(): T[] {
		
		if (this.arePointersReversed()) {
			
			return [
				...this.buffer.slice(this.firstIndex) as T[],
				...this.buffer.slice(0, this.getEndIndex()) as T[],
			];
			
		} else {
			
			return this.buffer.slice(this.firstIndex, this.size()) as T[];
			
		}
		
	}
	
}
