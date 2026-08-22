import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-topic text-4xl">Nothing here.</p>
      <Link to="/" className="btn-primary">Back to SpeakWise</Link>
    </div>
  )
}
