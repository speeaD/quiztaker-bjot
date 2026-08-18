// const STEPS = [
//   {
//     num: "01",
//     title: "Join",
//     desc: "Create your free BJOT account in seconds.",
//     img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop",
//   },
//   {
//     num: "02",
//     title: "Learn",
//     desc: "Access lessons and study at your own pace.",
//     img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400&auto=format&fit=crop",
//   },
//   {
//     num: "03",
//     title: "Practice",
//     desc: "Take BJOT CBTs and mock exams that mimic the real thing.",
//     img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop",
//   },
//   {
//     num: "04",
//     title: "Improve",
//     desc: "Track your progress and keep getting better.",
//     img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400&auto=format&fit=crop",
//   },
// ];

import Image from "next/image";

// export default function HowItWorks() {
//   return (
//     <section>
//       <div className="wrap">
//         <div className="section-head">
//           <div className="eyebrow">Getting started</div>
//           <h2>How BJOT Works</h2>
//           <p>Four simple steps between you and your dream score.</p>
//         </div>
//         <div className="steps-grid">
//           {STEPS.map((s) => (
//             <div className="step" key={s.num}>
//               <div className="photo">
//                 <span className="num">{s.num}</span>
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={s.img} alt={s.title} />
//               </div>
//               <h3>{s.title}</h3>
//               <p>{s.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

const STEPS = [
  {
    num: "01",
    title: "Join",
    desc: "Create your free BJOT account in seconds.",
    illustration: <Image className="step-illustration" src="/join.svg" alt="Join illustration" width={100} height={100} />
  },
  {
    num: "02",
    title: "Learn",
    desc: "Access lessons and study at your own pace.",
    illustration: <Image className="step-illustration" src="/learn.svg" alt="Learn illustration" width={100} height={100} />
  },
  {
    num: "03",
    title: "Practice",
    desc: "Take BJOT CBTs and mock exams that mimic the real thing.",
    illustration: <Image className="step-illustration" src="/practice.svg" alt="Practice illustration" width={100} height={100} />
  },
  {
    num: "04",
    title: "Improve",
    desc: "Track your progress and keep getting better.",
    illustration: <Image className="step-illustration" src="/improve.svg" alt="Improve illustration" width={100} height={100} />
  },
];

export default function HowItWorks() {
  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Getting started</div>
          <h2>How BJOT Works</h2>
          <p>Four simple steps between you and your dream score.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div className="step" key={s.num}>
              <div className="photo photo-illustrated">
                <span className="num">{s.num}</span>
                {s.illustration}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}