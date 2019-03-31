let randomSeed = 0;

export default class Utils {
    static dim(vec) {
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    }

    static add(vec1, vec2) {
        return {
            x: vec1.x + vec2.x,
            y: vec1.y + vec2.y,
        };
    }

    static sub(vec1, vec2) {
        return {
            x: vec1.x - vec2.x,
            y: vec1.y - vec2.y,
        };
    }

    static dot(vec1, vec2) {
        return vec1.x * vec2.x + vec1.y * vec2.y;
    }

    static scalarMult(s, v) {
        return {
            x: s * v.x,
            y: s * v.y,
        };
    }

    static normalize(vec) {
        const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

        return {
            x: vec.x / len,
            y: vec.y / len,
        };
    }

    static cosAngleBetween(vec1, vec2) {
        const dotProduct = Utils.dot(vec1, vec2);
        const dimProduct = Utils.dim(vec1) * Utils.dim(vec2);

        return dotProduct / dimProduct;
    }

    static distance(vec1, vec2) {
        const diffX = vec1.x - vec2.x;
        const diffY = vec1.y - vec2.y;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    static isZeroVec(v) {
        return Utils.dim(v) < 0.001;
    }

    static copy(vec) {
        return {
            x: vec.x,
            y: vec.y,
        };
    }

    static seedRandom(seed) {
        randomSeed = seed;
    }

    static random() {
        const r = Math.sin(randomSeed++) * 10000;
        return r - Math.floor(r);
    }
}
