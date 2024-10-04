import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const vertexShader = `
precision mediump float;
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;
uniform float iTime;
uniform vec2 iResolution;

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i * 0.4 + iTime * 0.4);

        d = sin(d * 8.0 + iTime) / 8.0;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const AnimatedShaderMesh = () => {
    const materialRef = useRef(null);
    const { size, gl } = useThree();
    gl.setPixelRatio(1);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            const material = materialRef.current;
            material.uniforms.iTime.value = clock.getElapsedTime();
            material.uniforms.iResolution.value.set(size.width, size.height);
        }
    });

    const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(size.width, size.height) },
    };

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
        </mesh>
    );
}

const AnimatedShader = () => (
    <Canvas style={{ width: '100vw', height: '100vh' }}>
        <AnimatedShaderMesh />
    </Canvas>
);

export default AnimatedShader;