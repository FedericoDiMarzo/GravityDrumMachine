class MathTools {
    /**
     * Dot product of two vectors.
     * @param x
     * @param y
     * @return {number}
     */
    static dot(x, y) {
        let res = 0;
        x.forEach((el, i) => res += x[i] * y[i]);
        return res;
    }

    /**
     * Module of a vector.
     * @param x
     * @return {number}
     */
    static module(x) {
        let res = 0;
        x.forEach(el => res += Math.pow(el, 2));
        return Math.sqrt(res);
    }

    /**
     * Difference between two vectors.
     * @param x
     * @param y
     * @return {[]}
     */
    static difference(x, y) {
        let res = [];
        x.forEach((el, i) => res.push(x[i] - y[i]));
        return res;
    }

    /**
     * Limits angular functions between -1 and 1
     * @param x
     * @return -1, 1, or fun
     */
    static clipAngle(x) {
        if (x > 1) {
            x = 1;
        } else if (x < -1) {
            x = -1;
        }
        return x;
    }

    /**
     * Sum between two vectors.
     * @param x
     * @param y
     * @return {[]}
     */
    static sum(x, y) {
        return this.difference(x, this.product(-1, y));
    }

    /**
     * Product between a scalar and a vector.
     * @param k scalar
     * @param v vector
     * @return {[]}
     */
    static product(k, v) {
        let res = [];
        v.forEach(el => res.push(el * k));
        return res;
    }

     /**
     * Returns 2d array in phi-rotated reference frame
     * @param vpol array in old reference frame
     * @param phi angle
     * @returns {*[]} array in new reference frame


    static changeFrame(vpol, phi) {
        return [vpol[0] * Math.cos(phi) - vpol[1] * Math.sin(phi), vpol[1] * Math.cos(phi) + vpol[0] * Math.sin(phi)];
    }**/

    static fraction2String(n, d) {
        return n.toString() + "/" + d.toString();
    }

    static string2Fraction(str) {
        let tmp = str.split("/");
        return {
            num: parseInt(tmp[0]),
            den: parseInt(tmp[1])
        }
    }

    /** Least common multiplier of multiple values.
     *
     * @param values array of numbers
     * @returns {number}
     */
    static lcmMultiple(values) {

        if (values.length < 1) {
            console.log("Error, lcmMultiple needs at least 1 value!");
            return undefined;
        }

        let result = values[0];
        for (let i = 0; i + 2 <= values.length; i++) {
            result = this.lcm(result, values[i + 1]);
        }

        return result;

    }

    /**
     * Least common multiplier.
     *
     * @param x
     * @param y
     * @return {boolean|number}
     */
    static lcm(x, y) {
        if ((typeof x !== 'number') || (typeof y !== 'number'))
            return false;
        return (!x || !y) ? 0 : Math.abs((x * y) / this.gcd(x, y));
    }

    /**
     * Greater common divider.
     *
     * @param x
     * @param y
     * @return {number}
     */
    static gcd(x, y) {
        x = Math.abs(x);
        y = Math.abs(y);
        while (y) {
            let t = y;
            y = x % y;
            x = t;
        }
        return x;
    }


    static hex2rgba(hex, opacity) {
        let r = 0, g = 0, b = 0;

        // 3 digits
        if (hex.length === 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];

            // 6 digits
        } else if (hex.length === 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }

        return "rgba(" + +r + "," + +g + "," + +b + "," + opacity + ")";
    }
}

export default MathTools;