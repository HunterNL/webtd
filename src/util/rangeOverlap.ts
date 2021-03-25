export function doRangesOverlap(start1:number,end1:number,start2:number,end2:number) {
    return !(end1 <= start2 || end2 <= start1);
}