import { Fragment, useRef } from "react";
import Sphere from "@/components/three/Sphere";
import AnimatedShader from "@/components/three/AnimatedShader";


function Home() {
    return (
        <Fragment>
            <div className="absolute z-10">
                <Sphere />
            </div>
            <div className="absolute top-0 opacity-30">
                <AnimatedShader />
            </div>
        </Fragment>
    );
}

export default Home;
