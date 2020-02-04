class CanvasTools{
    /**
     * @returns system canvas width
     */
    static getWidth(){
        return document.getElementById("gravity-canvas").width;
    }
    /**
     * @returns system canvas heidth
     */
    static getHeight(){
        return document.getElementById("gravity-canvas").height;
    }
    /**
     * @returns canvas diagonal
     */
    static getDiagonal(){
        return Math.sqrt(Math.pow(this.getWidth(), 2) + Math.pow(this.getHeight(), 2));
    }
    /**
     * @returns system canvas width / 2
     */
    static getHalfWidth(){
        return this.getWidth() / 2;
    }
    /**
     * @returns system canvas height / 2
     */
    static getHalfHeight(){
        return this.getHeight() / 2;
    }
    /**
     * @returns system canvas diagonal / 2
     */
    static getHalfDiagonal(){
        return this.getDiagonal() / 2;
    }
}

export default CanvasTools;