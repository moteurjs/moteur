import { Rectangle } from "@webng/math";

export class Texture {
    private constructor(
        private gl: WebGL2RenderingContext,
        private texture: WebGLTexture,
        private image: HTMLImageElement,
        public readonly view: Rectangle,
    ) {}

    public static async fromFile(
        gl: WebGL2RenderingContext,
        path: string,
    ): Promise<Texture> {
        const texture = gl.createTexture();

        if (texture === null) throw Error("Failed to create texture");

        const image = new Image();

        await new Promise((accept, reject) => {
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    image,
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MIN_FILTER,
                    gl.NEAREST,
                );
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_MAG_FILTER,
                    gl.NEAREST,
                );
                gl.generateMipmap(gl.TEXTURE_2D);

                accept(null);
            };
            image.onerror = () => {
                reject();
            };
            image.src = path;
        });

        return new Texture(
            gl,
            texture,
            image,
            new Rectangle(0, 0, image.width, image.height),
        );
    }

    public resize(view: Rectangle): Texture {
        return new Texture(this.gl, this.texture, this.image, view);
    }

    public uvRectangle(): Rectangle {
        return new Rectangle(
            this.view.x / this.image.width,
            this.view.y / this.image.height,
            this.view.width / this.image.width,
            this.view.height / this.image.height,
        );
    }

    public bind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
}
