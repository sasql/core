export function expect2(o: object | Array<any>) {
    expect(o).toBeTruthy();
    expect(typeof o).toEqual('object');

    return {
        toHaveLengthOf(expected: number) {
            if (Array.isArray(o)) {
                expect(o.length).toEqual(expected);
            } else {
                expect(Object.keys(o).length).toEqual(expected);
            }
        }
    };
}
