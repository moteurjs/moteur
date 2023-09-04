export class Geometry {
    private constructor(
        private gl: WebGL2RenderingContext,
        private buffer: WebGLBuffer,
        private entryCount: number,
    ) {}

    public static fromBuffer(
        gl: WebGL2RenderingContext,
        data: Float32Array | Uint32Array | Int32Array,
    ) {
        const buffer = gl.createBuffer();

        if (buffer === null) throw Error("Failed to create buffer");

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        return new this(gl, buffer, data.length);
    }

    public bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    }

    public draw(vertexSize: number) {
        this.gl.drawArrays(
            this.gl.TRIANGLES,
            0,
            Math.floor(this.entryCount / vertexSize),
        );
    }
}
