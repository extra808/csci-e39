import http from 'http'
import Koa from 'koa'
import logger from 'koa-logger'
import route from 'koa-route'
import serve from 'koa-static'
import views from 'koa-views'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import socketio from 'socket.io'
import config from './config'
import {Student} from './db'
import App from './ui/app.jsx'

/* ------------------------------- ENDPOINTS ------------------------------- */

const app = new Koa()

if (config.env !== `test`) app.use(logger())

app.use(serve(`public`))

app.use(views(`${__dirname}/ui`, {extension: `pug`}))

app.use(route.get(`/`, async ctx => {
	await ctx.render(`index`, {
		app: renderApp({registration: {status: `init`, message: ``}, actions: {}}),
		backend: config.backend,
	})
}))

/* -------------------------------- SERVER --------------------------------- */

const server = http.createServer(app.callback())

const io = socketio(server)

io.on(`connection`, socket => {

	socket.use(ensureStudent(socket))

	socket.on(`register`, async () => {
		const {student} = socket.ctx
		try {
			if (!!student.get(`confirmed_at`)) return socket.emit(`register.failure`, {message: `This ID has already been used`})

			const updatedStudent = await student.save({confirmed_at: new Date()}, {patch: true})
			if (!updatedStudent) return socket.emit(`register.failure`, {message: `Failed to register you - please try again`})

			socket.emit(`register.success`, {message: `${student.get(`name`)} registered!`})
		} catch (e) {
			socket.emit(`register.failure`, {message: `Unexpected failure - please try again`})
		}
	})

})

server.listen(config.port, () => console.log(`=== SERVER ===: listening at localhost:${config.port}`))

/* -------------------------------- HELPERS -------------------------------- */

function renderApp(props) {
	return ReactDOMServer.renderToString(<App {...props} />)
}

function ensureStudent(socket) {
	return async (packet, next) => {
		const {studentId} = socket.handshake.query

		if (studentId === `id-not-set`) return next(new AuthError(`.id file must exist`))

		const student = await Student.where(`unique_id`, studentId).fetch()
		if (!student) return next(new AuthError(`Student ID does not exist`))

		socket.ctx = {student}

		next()
	}
}

class AuthError extends Error {
	constructor(message) {
		super(message)
		this.data = [`auth.failure`, {message}]
	}
}