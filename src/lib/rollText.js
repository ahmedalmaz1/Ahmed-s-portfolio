const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

export default function RollText({ text }) {
  return (
    <span aria-hidden="true" className="flex">
      {text.split("").map((c, i) => {
        const ch = c === " " ? "\u00A0" : c;
        const style = { transitionDelay: `${i * 16}ms` };
        return (
          <span
            key={i}
            className="relative inline-block overflow-hidden leading-[1.5]"
          >
            <span
              style={style}
              className={`block text-neutral-300 transition-transform duration-[650ms] ${EASE} group-hover:-translate-y-full`}
            >
              {ch}
            </span>
            <span
              style={style}
              className={`absolute inset-0 block translate-y-full text-accent transition-transform duration-[650ms] ${EASE} group-hover:translate-y-0`}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </span>
  );
}
