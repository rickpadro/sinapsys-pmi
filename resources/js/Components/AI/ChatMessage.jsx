export default function ChatMessage({ message }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className="max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap"
                style={{
                    backgroundColor: isUser ? 'var(--primary)' : 'var(--surface)',
                    color: isUser ? 'white' : 'var(--foreground)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                }}
            >
                {message.content}
            </div>
        </div>
    );
}
