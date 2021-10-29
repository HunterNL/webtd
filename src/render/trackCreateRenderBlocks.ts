import { vec2 } from "gl-matrix";
import { chain, first, last } from "lodash";
import { vec2PathLerp } from ".";
import { DetectionBlock } from "../obj/detectionBlock";
import { isSwitch } from "../obj/physical/switch";
import { isWeld, segmentIsSwitchAdjecent, Track, TrackFeature, trackGetFeatures, trackGetRenderPath } from "../obj/physical/track";

/**
 * Takes a track and:
 * - Figures out the position of all features on its renderpath
 * - Splits up these features at welds into blocks
 * - Constructs the individual renderPaths for each block
 * @param track
 * @returns DetectionBlock[]
 */

export function trackCreateRenderBlocks(track: Track): DetectionBlock[] {
    const baseSegments = chain(track.segments.detection).reject(segmentIsSwitchAdjecent).value();

    if (baseSegments.length === 0) {
        return [];
    }

    const features = trackGetFeatures(track);
    const weldCount = features.filter(isWeld).length;

    if (baseSegments.length !== weldCount + 1) {
        throw new Error("Segment size mismatch " + baseSegments.length + " <> " + (weldCount + 1));
    }

    const startsAtSwitch = isSwitch(track.boundries[0]);
    const endsAtSwitch = isSwitch(track.boundries[1]);

    const renderPath = trackGetRenderPath(track);

    const startPos = first(renderPath);
    const endPos = last(renderPath);

    if (!startPos) {
        throw new Error("No startPos");
    }

    if (!endPos) {
        throw new Error("No endPos");
    }

    const featuresWithRenderPos = interpolateFeaturePositions(renderPath, features, track.length);


    // Loop setup
    const blocks: DetectionBlock[] = [];
    let renderPoints = [startPos] as vec2[];
    let segmentCount = 0;

    for (let index = 0; index < featuresWithRenderPos.length; index++) {
        const feature = featuresWithRenderPos[index];
        if (!feature) {
            throw new Error("No feature");
        }

        const renderPosition = feature.position; // endpoint of current "leg"
        if (!renderPosition) {
            throw new Error("Features has no renderPos");
        }

        renderPoints.push(renderPosition); //Add it for sure to the path
        let isFirstBlock = true; // Required for for figuring out what block borders a switch

        if (isWeld(feature)) {
            const segment = baseSegments[segmentCount];

            if (!segment) {
                throw new Error("No segment");

            }

            blocks.push({
                segment,
                renderPoints,
                startsAtSwitch: isFirstBlock && startsAtSwitch,
                endsAtSwitch: false
            });
            segmentCount++;
            renderPoints = [renderPosition];
            isFirstBlock = false;
        }
    }

    renderPoints.push(endPos);

    blocks.push({
        renderPoints: renderPoints,
        segment: baseSegments[segmentCount],
        startsAtSwitch: featuresWithRenderPos.length === 0 && startsAtSwitch,
        endsAtSwitch: endsAtSwitch
    });

    return blocks;
}

export function interpolateFeaturePositions(renderPath: vec2[], features: TrackFeature[], trackLength: number): TrackFeature[] {
    return features.map(feature => {
        let position = feature.position;

        if(!position && isWeld(feature)) {
            position = vec2PathLerp(renderPath,feature!.offset / trackLength);
        }

        return {...feature, position} as TrackFeature
    })
}