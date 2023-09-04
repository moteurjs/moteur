import { Camera } from "./camera";
import { Geometry } from "./geometry";
import { Shader, ShaderVariableType } from "./shader";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders/sprite";
import { Sprite } from "./sprite";
import { Component, System } from "@webng/ecs";
import { Transform } from "@webng/math";

export class RenderContext extends Component {
    public readonly canvas: HTMLCanvasElement =
        null as unknown as HTMLCanvasElement;
    public readonly gl: WebGL2RenderingContext =
        null as unknown as WebGL2RenderingContext;

    public constructor(canvasId: string) {
        super();

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
    }
}

export interface SpriteRendererProps {
    backgroundColor?: [number, number, number, number];
}

export class SpriteRenderer extends System {
    private shaders: Map<WebGL2RenderingContext, Shader> = new Map();
    private geometries: Map<WebGL2RenderingContext, Geometry> = new Map();

    private backgroundColor: [number, number, number, number];

    public constructor(props?: SpriteRendererProps) {
        super();
        this.backgroundColor = props?.backgroundColor ?? [0, 0, 0, 0xff];
    }

    public async init() {}

    public async update(_timestamp: number) {
        const contexts = this.entities
            .query(RenderContext)
            .map(([context]) => context);

        const data = contexts.map((context) => {
            if (!this.shaders.has(context.gl)) {
                const shader = Shader.fromSource(
                    context.gl,
                    VERTEX_SHADER,
                    FRAGMENT_SHADER,
                )
                    .addAttribute("a_position", ShaderVariableType.FLOAT2)
                    .addAttribute("a_uv", ShaderVariableType.FLOAT2);

                this.shaders.set(context.gl, shader);
            }

            if (!this.geometries.has(context.gl)) {
                const geometry = Geometry.fromBuffer(
                    context.gl,
                    new Float32Array([
                        -0.5, -0.5, 0.0, 1.0, 0.5, 0.5, 1.0, 0.0, -0.5, 0.5,
                        0.0, 0.0, -0.5, -0.5, 0.0, 1.0, 0.5, 0.5, 1.0, 0.0, 0.5,
                        -0.5, 1.0, 1.0,
                    ]),
                );

                this.geometries.set(context.gl, geometry);
            }

            return [
                context,
                this.shaders.get(context.gl) as Shader,
                this.geometries.get(context.gl) as Geometry,
            ] as const;
        });

        const cameras = this.entities.query(Camera, Transform);
        const objects = this.entities.query(Sprite, Transform);

        data.forEach(([context, shader, geometry]) => {
            context.gl.enable(context.gl.DEPTH_TEST);
            context.gl.clearDepth(1.0);

            context.gl.enable(context.gl.BLEND);
            context.gl.blendFunc(
                context.gl.SRC_ALPHA,
                context.gl.ONE_MINUS_SRC_ALPHA,
            );

            context.gl.clearColor(
                this.backgroundColor[0],
                this.backgroundColor[1],
                this.backgroundColor[2],
                this.backgroundColor[3],
            );

            context.gl.clear(
                context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT,
            );

            geometry.bind();
            shader.bind();

            shader.bindUniform(
                "u_aspectRatio",
                ShaderVariableType.FLOAT1,
                context.canvas.width / context.canvas.height,
            );

            cameras.forEach(([_camera, transform]) => {
                shader.bindUniform(
                    "u_cameraPosition",
                    ShaderVariableType.FLOAT2,
                    transform.position,
                );
                shader.bindUniform(
                    "u_cameraScale",
                    ShaderVariableType.FLOAT2,
                    transform.scale,
                );

                objects.forEach(([sprite, transform]) => {
                    shader
                        .bindUniform(
                            "u_position",
                            ShaderVariableType.FLOAT2,
                            transform.position,
                        )
                        .bindUniform(
                            "u_rotation",
                            ShaderVariableType.FLOAT1,
                            transform.rotation,
                        )
                        .bindUniform(
                            "u_scale",
                            ShaderVariableType.FLOAT2,
                            transform.scale,
                        )
                        .bindUniform(
                            "u_depth",
                            ShaderVariableType.FLOAT1,
                            transform.depth,
                        );

                    const rect = sprite.texture.uvRectangle();

                    sprite.texture.bind();

                    shader
                        .bindUniform("u_texture", ShaderVariableType.INT1, 0)
                        .bindUniform(
                            "u_texturePosition",
                            ShaderVariableType.FLOAT2,
                            [rect.x, rect.y],
                        )
                        .bindUniform(
                            "u_textureScale",
                            ShaderVariableType.FLOAT2,
                            [rect.width, rect.height],
                        );

                    geometry.draw(4);
                });
            });
        });
    }
}
