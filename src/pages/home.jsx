import { Fragment, useState, useRef, useEffect } from "react";
import Sphere from "@/components/three/Sphere";
import WhiteSphere from "@/components/three/WhiteSphere";
import AnimatedShader from "@/components/three/AnimatedShader";
import StartShader from "@/components/three/StartShader";
import OceanShader from "@/components/three/OceanShader";
import EventEmitter from "eventemitter3";

const PlusOne = ({ EE }) => {
    const [plusOnes, setPlusOnes] = useState([]);

    const handleTap = () => {
        EE.emit('tap');
        const sphereCenter = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };

        // Generate random positions around the sphere
        const angle = Math.random() * Math.PI * 2; // Random angle
        const radius = 120; // Distance from the center of the sphere
        const plusOnePosition = {
            id: Date.now(),
            x: sphereCenter.x + Math.cos(angle) * (radius + 20 * Math.random()) - 10,
            y: sphereCenter.y + Math.sin(angle) * (radius + 20 * Math.random()) - 10,
        };

        setPlusOnes((prevPlusOnes) => [...prevPlusOnes, plusOnePosition]);

        // Remove after a short delay
        setTimeout(() => {
            setPlusOnes((prevPlusOnes) => prevPlusOnes.filter((plusOne) => plusOne.id !== plusOnePosition.id));
        }, 1000); // Adjust time for how long you want it to show
    };

    return (
        <div className="absolute inset-0 w-screen h-screen">
            <button onClick={handleTap} className="absolute flex justify-center items-center rounded-full border-4 border-yellow-400 active:border-yellow-600 top-1/2 left-1/2 w-[100px] h-[100px] -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-all duration-300 outline-none">
                <img src="/imgs/cursor1.png" className="h-[60px]" alt="" />
            </button>
            {plusOnes.map((plusOne) => (
                <span
                    key={plusOne.id}
                    className="absolute text-white pointer-events-none animate-fadeup text-[20px] font-bold transition-opacity duration-1000"
                    style={{ left: plusOne.x, top: plusOne.y }}
                >
                    +1
                </span>
            ))}
            <div className="relative mt-[500px] w-[250px] mx-auto border-2 border-white rounded-[5px] h-[18px] grid [grid-template-columns:repeat(17,minmax(0,1fr))] gap-[2px] px-[2px] py-px">
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="bg-white" />
                <div className="absolute top-1/2 -translate-y-1/2 right-1 leading-none text-white text-[10px] font-bold">global sync signal</div>
            </div>
        </div>
    )
}

function Home() {
    const EE = new EventEmitter();
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

    return (
        <Fragment>
            { visibleSphere && <div className="absolute z-20 animate-fadein">
                <WhiteSphere EE={EE}  />
                <PlusOne EE={EE} />
            </div> }
            { visibleShader && <div className="absolute top-0">
                {/* <AnimatedShader /> */}
                <OceanShader />
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
