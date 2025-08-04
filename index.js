import express from 'express'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const upload = multer()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// garbage fancy-ass upload page
const uploadPage = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>PISSANDSHITIMAGES UPLOADER</title>
	<style>
		body {
			margin: 0;
			padding: 0;
			font-family: 'Comic Sans MS', cursive, sans-serif;
			background: linear-gradient(135deg, #ff00cc, #3333ff);
			color: white;
			text-align: center;
		}
		h1 {
			font-size: 4em;
			text-shadow: 2px 2px 8px black;
			margin-top: 2em;
		}
		form {
			margin-top: 3em;
			background: rgba(255,255,255,0.1);
			padding: 2em;
			border-radius: 20px;
			display: inline-block;
			box-shadow: 0 0 30px magenta;
		}
		input[type="file"] {
			padding: 1em;
			font-size: 1.2em;
			border: 2px dashed white;
			border-radius: 10px;
			background-color: rgba(255,255,255,0.2);
			color: white;
		}
		button {
			margin-top: 1em;
			padding: 1em 2em;
			font-size: 1.5em;
			background: #00ffff;
			color: black;
			border: none;
			border-radius: 15px;
			cursor: pointer;
			box-shadow: 0 0 10px #fff;
			transition: transform 0.3s ease;
		}
		button:hover {
			transform: scale(1.1) rotate(1deg);
			box-shadow: 0 0 20px #fff;
		}
	</style>
</head>
<body>
	<h1>💩 PISSANDSHITIMAGES UPLOADER 💩</h1>
	<form action="/upload" method="POST" enctype="multipart/form-data">
		<input type="file" name="image" accept="image/*" required><br>
		<button type="submit">SHITIFY</button>
	</form>
</body>
</html>
`

app.get('/', (req, res) => {
	res.send(uploadPage)
})

// upload endpoint
app.post('/upload', upload.single('image'), async (req, res) => {
	if (!req.file) return res.status(400).send('no file dumbass')
	const base64 = req.file.buffer.toString('base64')
	const mimetype = req.file.mimetype

	const { data, error } = await supabase
	.from('images')
	.insert([{ data: base64, mimetype }])
	.select()

    if (error) {
        console.error('Insert error:', error)
        return res.status(500).send('supabase just shat itself')
    }

    if (!data || data.length === 0) {
        console.error('Insert returned no data:', data)
        return res.status(500).send('insert returned no data')
    }

	const id = data[0].id // UUID string now
	res.send(`uploaded. view it at <a href="/i/${id}">/i/${id}</a>`)
})

function base64ToBytes(b64) {
	// base64 length * 3/4 - padding
	let padding = 0
	if (b64.endsWith('==')) padding = 2
	else if (b64.endsWith('=')) padding = 1
	return (b64.length * 3) / 4 - padding
}

// Route #1: Serve the swag page with Open Graph tags
app.get('/i/:id', async (req, res) => {
	const { data, error } = await supabase.from('images').select().eq('id', req.params.id).single()
	if (error || !data) return res.status(404).send('image died')

	const fileSizeBytes = base64ToBytes(data.data)
	const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2)

	// Build absolute URL for raw image (adjust domain as needed)
	const baseURL = `https://${req.headers.host}`
	const imageURL = `${baseURL}/i/${req.params.id}/raw`

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>PISSANDSHITIMAGES - Image ${req.params.id}</title>

	<meta property="og:title" content="PISSANDSHITIMAGES.VERCEL.APP - THE BEST IMAGE HOSTER EVER" />
	<meta property="og:description" content="OOOOHHHH!!111 i just wasted ${fileSizeMB} PENTABYTES TO SHOW YOU THIS GARBAGE" />
	<meta property="og:image" content="${imageURL}" />
	<meta property="og:type" content="image" />
	<meta property="twitter:card" content="summary_large_image" />

	<style>
		body {
			background: #111;
			color: #eee;
			font-family: 'Comic Sans MS', cursive, sans-serif;
			text-align: center;
			padding: 3rem;
		}
		h1 {
			font-size: 3rem;
			margin-bottom: 1rem;
			text-shadow: 2px 2px 6px #f0f;
		}
		p {
			font-size: 1.5rem;
			margin-bottom: 3rem;
			color: #f0f;
			text-shadow: 1px 1px 4px #333;
		}
		img {
			max-width: 90vw;
			max-height: 70vh;
			border-radius: 20px;
			box-shadow: 0 0 30px magenta;
			animation: bounce 2s infinite alternate;
		}
		@keyframes bounce {
			from { transform: translateY(0); }
			to { transform: translateY(-15px); }
		}
	</style>
</head>
<body>
	<h1>💩 PISSANDSHITIMAGES 💩</h1>
	<p>OOOOHHHH!!111 i just wasted <strong>${fileSizeMB} PENTABYTES</strong> TO SHOW YOU THIS GARBAGE</p>
	<img src="${imageURL}" alt="Shitfuck image ${req.params.id}" />
</body>
</html>`

	res.set('Content-Type', 'text/html')
	res.send(html)
})

// Route #2: Serve raw image bytes like before
app.get('/i/:id/raw', async (req, res) => {
	const { data, error } = await supabase.from('images').select().eq('id', req.params.id).single()
	if (error || !data) return res.status(404).send('image died')

	res.set('Content-Type', data.mimetype)
	res.send(Buffer.from(data.data, 'base64'))
})

app.listen(port, () => {
	console.log(`PISSANDSHITIMAGES listening on port ${port}`)
})
