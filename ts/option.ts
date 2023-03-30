/*
 * Created by Trevor Sears <trevor@trevorsears.com> (https://trevorsears.com/).
 * 2:18 PM -- March 28, 2023.
 * Project: jsdsl
 */

export class Option<T> {
	
	protected hasInternalValue: boolean;
	
	protected value?: T;
	
	protected constructor(hasValue: boolean, value?: T) {
		
		this.hasInternalValue = hasValue;
		this.value = value;
		
	}
	
	public static some<T>(value: T): Option<T> {
		
		return new Option<T>(true, value);
		
	}
	
	public static none<T>(): Option<T> {
		
		return new Option<T>(false);
		
	}
	
	public isSome(): boolean {
		
		return this.hasInternalValue;
		
	}
	
	public isNone(): boolean {
		
		return !this.hasInternalValue;
		
	}
	
	public expect(errorMessage: string): T {
		
		if (this.isSome()) return this.value as T;
		else throw new Error(errorMessage);
		
	}
	
	public getValue(): T | undefined {
		
		return this.value;
		
	}
	
	public getValueOrDefault(defaultValue: T): T {
		
		return this.isSome() ? this.value as T : defaultValue;
		
	}
	
	public getValueOrCalculatedDefault(callback: () => T): T {
		
		if (this.isSome()) return this.value as T;
		else return callback();
		
	}
	
	public setValue(value: T): void {
		
		this.hasInternalValue = true;
		this.value = value;
		
	}
	
	public setValueIfNone(valueIfNone: T): void {
		
		if (this.isNone()) this.value = valueIfNone;
		
	}
	
	public setNone(): void {
		
		this.hasInternalValue = false;
		this.value = undefined;
		
	}
	
	public contains(value: T): boolean {
		
		return this.isSome() && this.value === value;
		
	}
	
	public map<U>(callback: (value: T) => U): Option<U> {
		
		if (this.isNone()) return Option.none();
		else return Option.some(callback(this.value as T));
		
	}
	
	public filter(callback: (value: T) => boolean): Option<T> {
		
		if (this.isNone() || !callback(this.value as T)) return Option.none();
		else return Option.some(this.value as T);
		
	}
	
	public ifThen(callback: (value: T) => any): void {
		
		if (this.isSome()) callback(this.value as T);
		
	}
	
	public and(option: Option<T>): Option<T> {
		
		if (this.isSome() && option.isSome()) {
			
			return Option.some(option.value as T);
			
		} else return Option.none();
		
	}
	
	public or(option: Option<T>): Option<T> {
		
		if (this.isSome()) return Option.some(this.value as T);
		else if (option.isSome()) return Option.some(option.value as T);
		else return Option.none();
		
	}
	
	public xor(option: Option<T>): Option<T> {
		
		if (this.isSome() && option.isNone()) {
			
			return Option.some(this.value as T);
			
		} else if (this.isNone() && option.isSome()) {
			
			return Option.some(option.value as T);
			
		} else return Option.none();
		
	}
	
}
