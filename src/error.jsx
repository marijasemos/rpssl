export default function Error({title, message}) {
    return <div classname="error">
        <h2>{title}</h2>
        <p>{message}</p>
    </div>
}