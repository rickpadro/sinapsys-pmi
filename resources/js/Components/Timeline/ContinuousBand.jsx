export default function ContinuousBand({ section, height = 24 }) {
    return (
        <div
            className="absolute inset-x-0 flex items-center px-3"
            style={{
                height:          `${height}px`,
                backgroundColor: '#9B9DB015',
                borderTop:       '1px dashed #9B9DB060',
                borderBottom:    '1px dashed #9B9DB060',
            }}
        >
            <span className="text-[9px] font-medium truncate" style={{ color:'#9B9DB0' }}>
                ➿ {section.name}
            </span>
        </div>
    );
}
