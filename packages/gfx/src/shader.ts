import { Vector2 } from "@webng/math";

export enum ShaderVariableType {
    INT1,
    FLOAT1,
    FLOAT2,
}

type ShaderVariableTypeUniformMap = {
    [ShaderVariableType.INT1]: number;
    [ShaderVariableType.FLOAT1]: number;
    [ShaderVariableType.FLOAT2]: [number, number] | Vector2;
};

export interface ShaderAttribute {
    name: string;
    type: ShaderVariableType;
}

export class Shader {
    private attributes: Readonly<ShaderAttribute>[];

    private constructor(
        private gl: WebGL2RenderingContext,
        private shaders: WebGLShader[],
        private program: WebGLProgram,
    ) {
        this.attributes = [];
    }

    private static compileShader(
        gl: WebGL2RenderingContext,
        source: string,
        type: number,
    ): WebGLShader {
        const shader = gl.createShader(type);

        if (shader === null) throw Error("Failed to create shader");

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            throw Error(
                `Failed to compile shader: ${gl.getShaderInfoLog(shader)}`,
            );
        }

        return shader;
    }

    private static compileProgram(
        gl: WebGL2RenderingContext,
        shaders: WebGLShader[],
    ): WebGLProgram {
        const program = gl.createProgram();

        if (program === null) throw Error("Failed to create program");

        shaders.forEach((shader) => gl.attachShader(program, shader));

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            throw Error(
                `Failed to link program: ${gl.getProgramInfoLog(program)}`,
            );
        }

        return program;
    }

    public static fromSource(
        gl: WebGL2RenderingContext,
        vertexSource: string,
        fragmentSource: string,
    ) {
        const vertexShader = this.compileShader(
            gl,
            vertexSource,
            gl.VERTEX_SHADER,
        );
        const fragmentShader = this.compileShader(
            gl,
            fragmentSource,
            gl.FRAGMENT_SHADER,
        );
        const program = this.compileProgram(gl, [vertexShader, fragmentShader]);

        return new this(gl, [vertexShader, fragmentShader], program);
    }

    private getGLType(type: ShaderVariableType): [number, number, number] {
        switch (type) {
            case ShaderVariableType.INT1:
                return [this.gl.INT, 1, 4];
            case ShaderVariableType.FLOAT1:
                return [this.gl.FLOAT, 1, 4];
            case ShaderVariableType.FLOAT2:
                return [this.gl.FLOAT, 2, 4];
        }
    }

    public bind() {
        this.gl.useProgram(this.program);

        const delta = this.attributes.reduce((previous, { type }) => {
            const [_, typeCount, typeSize] = this.getGLType(type);
            return previous + typeCount * typeSize;
        }, 0);

        let offset = 0;
        this.attributes.forEach(({ name, type }) => {
            const index = this.gl.getAttribLocation(this.program, name);

            if (index === -1) throw Error(`Invalid attribute ${name}`);

            const [glType, typeCount, typeSize] = this.getGLType(type);

            this.gl.vertexAttribPointer(
                index,
                typeCount,
                glType,
                false,
                delta,
                offset,
            );
            this.gl.enableVertexAttribArray(index);

            offset += typeCount * typeSize;
        });
    }

    public addAttribute(name: string, type: ShaderVariableType): this {
        this.attributes.push({
            name,
            type,
        });

        return this;
    }

    public bindUniform<T extends ShaderVariableType>(
        name: string,
        type: T,
        data: ShaderVariableTypeUniformMap[T],
    ): this {
        const index = this.gl.getUniformLocation(this.program, name);

        let x,
            y = 0;
        switch (type) {
            case ShaderVariableType.INT1:
                x = data as number;
                this.gl.uniform1i(index, x);
                break;
            case ShaderVariableType.FLOAT1:
                x = data as number;
                this.gl.uniform1f(index, x);
                break;
            case ShaderVariableType.FLOAT2:
                if (data instanceof Vector2) {
                    x = data.x;
                    y = data.y;
                } else {
                    [x, y] = data as [number, number];
                }

                this.gl.uniform2f(index, x, y);
                break;
        }

        return this;
    }

    public delete() {
        this.gl.deleteProgram(this.program);
        this.shaders.forEach((shader) => this.gl.deleteShader(shader));
    }
}
