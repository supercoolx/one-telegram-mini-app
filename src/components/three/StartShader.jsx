import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
    uniform float iTime;
    uniform vec2 iResolution;

    mat2 Rot(float a) {
        float s=sin(a), c=cos(a);
        return mat2(c, -s, s, c);
    }
    #define PI 3.14159265359
    #define S 4.
    // the wave amplitude
    #define A 1.9
    // the wave length
    #define WAVEL 1.1


    // taken from thebookofshaders.com
    mat2 rotate2d(float _angle){
        return mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle));
    }

    // taken from thebookofshaderx.com
    mat2 scale(vec2 _scale){
        return mat2(_scale.x,0.0,0.0,_scale.y);
    }

    vec2 cartesianToPolar(vec2 cartesian) {
        float r = length(cartesian);          
        float theta = atan(cartesian.y, cartesian.x); 
        return vec2(r, theta);  
        
    }

    float Star(vec2 uv, float flare) {
        float d = length(uv);
        // the cirle of the star
        float m = 0.05/d;
        
        float rays = max(0.,1.-abs(uv.x * uv.y*1000.));
        m += rays;
        uv *= Rot(3.1415/4.);
        rays = max(0.,1.-abs(uv.x * uv.y*1000.));
        m += rays * .3;
        return m;
    }

    float HexDist(vec2 p){
        p = abs(p);
        float c = dot(p, normalize(vec2(1, 1.73)));
        c= max(c,p.x);
        return c;
    }

    vec4 HexCoord(vec2 uv){
        vec2 r = vec2(1, 1.73);
        vec2 h = r * 0.5;
        vec2 a = mod(fract(uv), r) - h;
        vec2 b = mod(fract(uv) - h, r) - h;
        
        vec2 gv;
        if(length(a) < length(b))
            gv = a;
        else 
            gv = b;
            
        
        float x = atan(gv.x, gv.y);
        float y = 0.2 - HexDist(gv);
        vec2 id = uv - gv;
        return vec4(x, y, id.x, id.y);
    }

    float pattern(vec2 uv, float t){
        float speed = 0.5;
        return sin(uv.x * uv.x + uv.y * uv.y + t * speed);
    }
    void main()
    {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 uv = (fragCoord-0.5*iResolution.xy)/iResolution.y;
        uv *= 6.;
        
        vec2 uv2 = (fragCoord-0.5*iResolution.xy)/iResolution.y;
        vec4 hc = HexCoord(uv*uv);
        
        float c = smoothstep(0.02, 0.05, hc.y *  pattern(vec2(hc.z, hc.w), iTime) );

    
        //uv = cartesianToPolar(uv);
        vec2 wave1Center = vec2(-1., -0.5);
        //vec2 wave2Center = vec2(1., 0.5);
        wave1Center= vec2(0.);
        
        float disFromWave1Center = distance(uv, wave1Center);
        //float disFromWave2Center = distance(uv, wave2Center);
        
        float wave1 =  A * sin(disFromWave1Center / WAVEL - iTime / WAVEL);
        //float wave2 =  A * sin(disFromWave2Center / WAVEL - iTime / WAVEL) ;
    
        uv = uv + uv * (wave1+c) / WAVEL;
        vec3 col = vec3(0);
        
        col += Star(uv, 0.5);
        col *= Star(uv2, 1.5);
        

        gl_FragColor = vec4(col,1.0);
    }
`;

const StartShaderMesh = () => {
    const materialRef = useRef(null);
    const { size } = useThree();

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

const StartShader = () => (
    <Canvas style={{ width: '100vw', height: '100vh' }}>
        <StartShaderMesh />
    </Canvas>
);

export default StartShader;