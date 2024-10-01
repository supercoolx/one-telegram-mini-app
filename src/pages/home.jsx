import { Fragment, useState, useRef } from "react";
import Sphere from "@/components/three/Sphere";
import AnimatedShader from "@/components/three/AnimatedShader";
import StartShader from "@/components/three/StartShader";

function Home() {
    const startShader = useRef();
    const [visibleSphere, setVisibleSphere] = useState(false);
    const [visibleShader, setVisibleShader] = useState(false);
    const [visibleStartUpShader, setVisibleStartUpShader] = useState(true);

    const handleEntrance = () => {
        startShader.current.classList.remove('animate-fadein');
        startShader.current.classList.add('animate-fadeout');
        setTimeout(() => {
            setVisibleSphere(true);
            setVisibleShader(true);
            setVisibleStartUpShader(false);
        }, 5000);
    }

    const handleTap = () => {
        
    }

    return (
        <Fragment>
            { visibleSphere && <div className="absolute z-10 animate-fadein">
                <Sphere onClick={handleTap}  />
            </div> }
            { visibleShader && <div className="absolute top-0 opacity-30 ">
                <AnimatedShader />
            </div> }
            { visibleStartUpShader && <div ref={startShader} onClick={handleEntrance} className="absolute top-0 text-white animate-fadein">
                <StartShader />
                <div className="absolute flex flex-col items-center gap-[130px] text-[28px] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <div>Become One</div>
                    <div>Tap In</div>
                </div>
            </div> }
        </Fragment>
    );
}

export default Home;
