import { Fragment, useRef, useMemo } from "react";
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
// 1: show cloud noise, 0:show scene
#define show_noise 0

float noise_frequency = 24.0;
float noise_amplitude = 1.0;
float lacunarity = 2.0;
float gain = 0.5;
float noise_scale = 0.01;


// From GLM (gtc/noise.hpp & detail/_noise.hpp)
vec4 Mod289(vec4 x)
{
	return x - floor(x * vec4(1.0) / vec4(289.0)) * vec4(289.0);
}

vec4 Permute(vec4 x)
{
	return Mod289(((x * 34.0) + 1.0) * x);
}

vec4 TaylorInvSqrt(vec4 r)
{
	return vec4(1.79284291400159) - vec4(0.85373472095314) * r;
}

vec4 Fade(vec4 t)
{
	return (t * t * t) * (t * (t * vec4(6) - vec4(15)) + vec4(10));
}

float Remap(float origin_val, float origin_min, float origin_max, float new_min, float new_max)
{
    return new_min + ((origin_val - origin_min) / (origin_max - origin_min)) * (new_max - new_min);
}


float GlmPerlin4D(vec4 Position, vec4 rep)
{
		vec4 Pi0 = mod(floor(Position), rep);	// Integer part for indexing
		vec4 Pi1 = mod(Pi0 + vec4(1), rep);		// Integer part + 1
		//Pi0 = mod(Pi0, vec4(289));
		//Pi1 = mod(Pi1, vec4(289));
		vec4 Pf0 = fract(Position);	// Fractional part for interpolation
		vec4 Pf1 = Pf0 - vec4(1);		// Fractional part - 1.0
		vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
		vec4 iy = vec4(Pi0.y, Pi0.y, Pi1.y, Pi1.y);
		vec4 iz0 = vec4(Pi0.z);
		vec4 iz1 = vec4(Pi1.z);
		vec4 iw0 = vec4(Pi0.w);
		vec4 iw1 = vec4(Pi1.w);

		vec4 ixy = Permute(Permute(ix) + iy);
		vec4 ixy0 = Permute(ixy + iz0);
		vec4 ixy1 = Permute(ixy + iz1);
		vec4 ixy00 = Permute(ixy0 + iw0);
		vec4 ixy01 = Permute(ixy0 + iw1);
		vec4 ixy10 = Permute(ixy1 + iw0);
		vec4 ixy11 = Permute(ixy1 + iw1);

		vec4 gx00 = ixy00 / vec4(7);
		vec4 gy00 = floor(gx00) / vec4(7);
		vec4 gz00 = floor(gy00) / vec4(6);
		gx00 = fract(gx00) - vec4(0.5);
		gy00 = fract(gy00) - vec4(0.5);
		gz00 = fract(gz00) - vec4(0.5);
		vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
		vec4 sw00 = step(gw00, vec4(0.0));
		gx00 -= sw00 * (step(vec4(0), gx00) - vec4(0.5));
		gy00 -= sw00 * (step(vec4(0), gy00) - vec4(0.5));

		vec4 gx01 = ixy01 / vec4(7);
		vec4 gy01 = floor(gx01) / vec4(7);
		vec4 gz01 = floor(gy01) / vec4(6);
		gx01 = fract(gx01) - vec4(0.5);
		gy01 = fract(gy01) - vec4(0.5);
		gz01 = fract(gz01) - vec4(0.5);
		vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
		vec4 sw01 = step(gw01, vec4(0.0));
		gx01 -= sw01 * (step(vec4(0), gx01) - vec4(0.5));
		gy01 -= sw01 * (step(vec4(0), gy01) - vec4(0.5));

		vec4 gx10 = ixy10 / vec4(7);
		vec4 gy10 = floor(gx10) / vec4(7);
		vec4 gz10 = floor(gy10) / vec4(6);
		gx10 = fract(gx10) - vec4(0.5);
		gy10 = fract(gy10) - vec4(0.5);
		gz10 = fract(gz10) - vec4(0.5);
		vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
		vec4 sw10 = step(gw10, vec4(0));
		gx10 -= sw10 * (step(vec4(0), gx10) - vec4(0.5));
		gy10 -= sw10 * (step(vec4(0), gy10) - vec4(0.5));

		vec4 gx11 = ixy11 / vec4(7);
		vec4 gy11 = floor(gx11) / vec4(7);
		vec4 gz11 = floor(gy11) / vec4(6);
		gx11 = fract(gx11) - vec4(0.5);
		gy11 = fract(gy11) - vec4(0.5);
		gz11 = fract(gz11) - vec4(0.5);
		vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
		vec4 sw11 = step(gw11, vec4(0.0));
		gx11 -= sw11 * (step(vec4(0), gx11) - vec4(0.5));
		gy11 -= sw11 * (step(vec4(0), gy11) - vec4(0.5));

		vec4 g0000 = vec4(gx00.x, gy00.x, gz00.x, gw00.x);
		vec4 g1000 = vec4(gx00.y, gy00.y, gz00.y, gw00.y);
		vec4 g0100 = vec4(gx00.z, gy00.z, gz00.z, gw00.z);
		vec4 g1100 = vec4(gx00.w, gy00.w, gz00.w, gw00.w);
		vec4 g0010 = vec4(gx10.x, gy10.x, gz10.x, gw10.x);
		vec4 g1010 = vec4(gx10.y, gy10.y, gz10.y, gw10.y);
		vec4 g0110 = vec4(gx10.z, gy10.z, gz10.z, gw10.z);
		vec4 g1110 = vec4(gx10.w, gy10.w, gz10.w, gw10.w);
		vec4 g0001 = vec4(gx01.x, gy01.x, gz01.x, gw01.x);
		vec4 g1001 = vec4(gx01.y, gy01.y, gz01.y, gw01.y);
		vec4 g0101 = vec4(gx01.z, gy01.z, gz01.z, gw01.z);
		vec4 g1101 = vec4(gx01.w, gy01.w, gz01.w, gw01.w);
		vec4 g0011 = vec4(gx11.x, gy11.x, gz11.x, gw11.x);
		vec4 g1011 = vec4(gx11.y, gy11.y, gz11.y, gw11.y);
		vec4 g0111 = vec4(gx11.z, gy11.z, gz11.z, gw11.z);
		vec4 g1111 = vec4(gx11.w, gy11.w, gz11.w, gw11.w);

		vec4 norm00 = TaylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
		g0000 *= norm00.x;
		g0100 *= norm00.y;
		g1000 *= norm00.z;
		g1100 *= norm00.w;

		vec4 norm01 = TaylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
		g0001 *= norm01.x;
		g0101 *= norm01.y;
		g1001 *= norm01.z;
		g1101 *= norm01.w;

		vec4 norm10 = TaylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
		g0010 *= norm10.x;
		g0110 *= norm10.y;
		g1010 *= norm10.z;
		g1110 *= norm10.w;

		vec4 norm11 = TaylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
		g0011 *= norm11.x;
		g0111 *= norm11.y;
		g1011 *= norm11.z;
		g1111 *= norm11.w;

		float n0000 = dot(g0000, Pf0);
		float n1000 = dot(g1000, vec4(Pf1.x, Pf0.y, Pf0.z, Pf0.w));
		float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.z, Pf0.w));
		float n1100 = dot(g1100, vec4(Pf1.x, Pf1.y, Pf0.z, Pf0.w));
		float n0010 = dot(g0010, vec4(Pf0.x, Pf0.y, Pf1.z, Pf0.w));
		float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
		float n0110 = dot(g0110, vec4(Pf0.x, Pf1.y, Pf1.z, Pf0.w));
		float n1110 = dot(g1110, vec4(Pf1.x, Pf1.y, Pf1.z, Pf0.w));
		float n0001 = dot(g0001, vec4(Pf0.x, Pf0.y, Pf0.z, Pf1.w));
		float n1001 = dot(g1001, vec4(Pf1.x, Pf0.y, Pf0.z, Pf1.w));
		float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
		float n1101 = dot(g1101, vec4(Pf1.x, Pf1.y, Pf0.z, Pf1.w));
		float n0011 = dot(g0011, vec4(Pf0.x, Pf0.y, Pf1.z, Pf1.w));
		float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.z, Pf1.w));
		float n0111 = dot(g0111, vec4(Pf0.x, Pf1.y, Pf1.z, Pf1.w));
		float n1111 = dot(g1111, Pf1);

		vec4 fade_xyzw = Fade(Pf0);
		vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
		vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
		vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
		vec2 n_yzw = mix(vec2(n_zw.x, n_zw.y), vec2(n_zw.z, n_zw.w), fade_xyzw.y);
		float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
		return float(2.2) * n_xyzw;
}

float PerlinNoise3D(vec3 pIn, float frequency, int octaveCount, float scale, float amplitude)
{
	float octave_frenquency_factor = 2.0;			// noise frequency factor between octave, forced to 2
    pIn *= scale;
	// Compute the sum for each octave
	float sum = 0.0f;
	float weight_sum = 0.0f;
	float weight = 0.5f;
	for (int oct = 0; oct < octaveCount; oct++)
	{
		vec4 p = vec4(pIn.x, pIn.y, pIn.z, 0.0) * vec4(frequency);
		float val = GlmPerlin4D(p, vec4(frequency)) * amplitude;

		sum += val * weight;
		weight_sum += weight;

		weight *= weight;
		frequency *= octave_frenquency_factor;
	}

	float noise = (sum / weight_sum);// *0.5 + 0.5;;
	noise = min(noise, 1.0f);
	noise = max(noise, 0.0f);
	return noise;
}

float ray_height_intersection(vec3 ray_origin, vec3 ray_direction, float target_height)
{
    float ro_height = ray_origin.y;
    float rd_height = ray_direction.y;
    // parallel
    if(abs(rd_height) < 1e-3)
    {
        return 1e8;
    }
    float dist = (target_height - ro_height) / rd_height;
    
    return dist;
}

// get atmosphere density, according to sea level
// 获取大气密度
// 传入位置离海平面的高度，以及散射的相关基准高度
// 大气中任意一点的散射系数的计算，简化拆解为散射在海平面的散射系数，乘以基于海平面高度的该散射的大气密度计算公式
float get_atmos_density(float height_to_sea_level, float scale_height)
{
    return exp(-height_to_sea_level / scale_height);
}

float create_cloud_noise(vec3 pIn, float frequency, int octaveCount, float scale, float amplitude)
{
	float noise_result = PerlinNoise3D(pIn, frequency, octaveCount, scale*0.1, amplitude/5.0);
    noise_result += PerlinNoise3D(pIn, frequency, octaveCount, scale*0.15, amplitude/2.75);
    noise_result += PerlinNoise3D(pIn, frequency, octaveCount, scale*0.2, amplitude/5.5);

	return noise_result;
}

float create_water_noise(vec3 pIn, float frequency, int octaveCount, float scale, float amplitude)
{
	float noise_result = PerlinNoise3D(pIn, frequency*1.3, octaveCount, scale*0.1, amplitude/2.0);
    noise_result += PerlinNoise3D(pIn, frequency, octaveCount, scale*0.2, amplitude/1.3);
    noise_result += PerlinNoise3D(pIn, frequency, octaveCount, scale*0.5, amplitude/0.8);

	return noise_result;
}

vec3 cloud_calulation(vec3 ray_dir, vec3 ray_origin, float iTime)
{
	bool b_is_water = false;
	if(ray_dir.y < 1e-5)
	{
		ray_dir.y *= -1.;
		b_is_water = true;
	}
	
    float cloud_bottom = 15000.0, cloud_top = 75000.0;
    // cloud sample
    // ray cast to cloud layer
    float cloud_dist0 = ray_height_intersection(ray_origin, ray_dir, cloud_bottom);
    float cloud_dist1 = ray_height_intersection(ray_origin, ray_dir, cloud_top);

    float cloud_opacity = 0.0;
    vec3 cloud_color = vec3(5.0);
	float dist_threshold = 1e7;

	// too far
	if(cloud_dist0 > dist_threshold)
	{
		return cloud_color;
	}


	vec3 start_pos = ray_origin + ray_dir*cloud_dist0;
	start_pos.x += iTime*(1.0/10.0);
	int sample_steps = 32;        
	float in_cloud_ds= (cloud_dist1 - cloud_dist0) / float(sample_steps);

	for(int i = 0; i < sample_steps; ++i)
	{
		vec3 cloud_pos = start_pos + ray_dir*in_cloud_ds*float(i);
		
		float cloud_percentage = (cloud_pos.y - cloud_bottom) / (cloud_top - cloud_bottom);
		cloud_pos *= 0.000003;
		cloud_pos.y += iTime / 50.0;
		cloud_pos.xz += vec2(iTime / 50.0);
		float noise_result = create_cloud_noise(cloud_pos, noise_frequency, 1, 0.95, noise_amplitude*1.2);			
		noise_result /= 3.;
		//float tmp_density = fbm(cloud_pos, noise_scale, noise_frequency, noise_amplitude) * cloud_percentage * ds;            
		float tmp_density = noise_result * in_cloud_ds * cloud_percentage ;                        
		cloud_opacity += tmp_density;
	}

	//cloud_color = vec3(1.5) + cloud_opacity; 
	cloud_opacity /= (cloud_top - start_pos.y);

	// below is ocean
	if(b_is_water)
	{
		// if is water, mask with another noise for water look
		vec3 water_sample_pos = start_pos*0.00001;
		water_sample_pos.yz += iTime/10.0;
		// cloud_opacity += PerlinNoise3D(water_sample_pos, noise_frequency*1.3, 3, 1.0, 1.3);
		float water_reflection_noise = create_water_noise(water_sample_pos, noise_frequency, 5, 1.0, noise_amplitude*1.4);
		// water reflection noise's range is relative to the view direction, and also there should be dark area
		water_reflection_noise *= pow(dot(ray_dir, vec3(0,0,1)), 96.0) - 0.04;
		// i want ocean reflect cloud shape in a degree, so add cloud noise and water noise
		cloud_opacity = mix(cloud_opacity+water_reflection_noise, water_reflection_noise, 0.75);    
	}
	
    cloud_opacity = 1.0 - exp(-cloud_opacity);     
    // Calculate and return the final color.
    vec3 sky_color = vec3(0.0, 0.2, 0.65);

    return mix(sky_color, cloud_color, cloud_opacity);
}


/////////////////////////////////////////////////////////////////


void main()
{    
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord/iResolution.xy;
    uv = uv*2.0 - 1.0;
    uv.x *= iResolution.x/iResolution.y;

    vec3 fragPos = vec3(uv, 0.5);
    
#if show_noise==1
    fragPos += vec3(0, iTime/10.0, iTime/10.0);
    //gl_FragColor = vec4(vec3(fbm(fragPos, noise_scale, noise_frequency, noise_amplitude)), 1.0);
    float noise_result = create_cloud_noise(fragPos, noise_frequency, 5, 2.0, noise_amplitude);    
    noise_result = 1.0 - exp(-noise_result);
    gl_FragColor = vec4(noise_result);
#else
    vec3 ro = vec3(0., 0., -2.);
    vec3 rd = normalize(fragPos - ro);
    
    // camera is a little bit higher than ground
    vec3 camPos = vec3(0.0, 0.0, 0.0);
    
    vec3 color = cloud_calulation(rd, camPos, iTime);
    // Output to screen
    // gl_FragColor = vec4(color,1.0);
	// return;
    
    float exposure = 1.0;
    vec3 mapped = vec3(1.0) - exp(-color * exposure);
    // gamma correction
    const float gamma = 2.2;
    mapped = pow(mapped, vec3(1.0 / gamma));
    gl_FragColor = vec4(mapped, 1.0);
#endif          
}
`;

const OceanShaderMesh = () => {
    const materialRef = useRef(null);
    const { size, gl } = useThree();
    gl.setPixelRatio(1);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            const material = materialRef.current;
            material.uniforms.iTime.value = clock.getElapsedTime();
            material.uniforms.iResolution.value.set(size.width, size.height);
			gl.setSize(size.width, size.height);
        }
    });

    const uniforms = useMemo(() => {
		return {
			iTime: { value: 0 },
			iResolution: { value: new THREE.Vector2(size.width, size.height) },
		};
	}, []);

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

const OceanShader = () => (
    <Fragment>
        {/* <div className="absolute inset-0 z-10 w-screen h-screen bg-gradient-to-t from-[#001FFD]/50 to-[#3A8CD5]/50" /> */}
        <div className="absolute inset-0 z-10 w-screen h-screen bg-[url(/imgs/middlelayer.png)]" />
		
        <Canvas style={{ width: '100vw', height: '100vh' }}>
            <OceanShaderMesh />
        </Canvas>
    </Fragment>
);

export default OceanShader;