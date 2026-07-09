import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import nodemailer from 'nodemailer'
import {
  deleteCard,
  listCards,
  listReservations,
  saveCard,
  saveCards,
  saveReservation,
  supabase,
  updateReservation,
} from './supabase.js'

dotenv.config({ path: new URL('.env', import.meta.url) })
dotenv.config()

const app = express()
const port = process.env.PORT || 4242
const clientUrl = process.env.CLIENT_URL || 'http://127.0.0.1:5175'
const reservationToEmail = process.env.RESERVATION_TO_EMAIL

const smtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  reservationToEmail,
)

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

app.use(cors({ origin: clientUrl }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    emailConfigured: smtpConfigured,
    supabaseConfigured: Boolean(supabase),
  })
})

app.get('/api/config', (_request, response) => {
  response.json({
    emailEnabled: smtpConfigured,
    databaseEnabled: Boolean(supabase),
  })
})

app.get('/api/cards', async (_request, response) => {
  try {
    response.json({ cards: await listCards() })
  } catch (error) {
    response.status(502).json({ error: `Erreur Supabase : ${error.message}` })
  }
})

app.put('/api/cards', async (request, response) => {
  try {
    const { cards = [] } = request.body
    await saveCards(cards)
    response.json({ saved: true })
  } catch (error) {
    response.status(502).json({ error: `Erreur Supabase : ${error.message}` })
  }
})

app.put('/api/cards/:id', async (request, response) => {
  try {
    await saveCard({ ...request.body, id: request.params.id })
    response.json({ saved: true })
  } catch (error) {
    response.status(502).json({ error: `Erreur Supabase : ${error.message}` })
  }
})

app.delete('/api/cards/:id', async (request, response) => {
  try {
    await deleteCard(request.params.id)
    response.json({ deleted: true })
  } catch (error) {
    response.status(502).json({ error: `Erreur Supabase : ${error.message}` })
  }
})

app.get('/api/reservations', async (_request, response) => {
  try {
    response.json({ reservations: await listReservations() })
  } catch (error) {
    response.status(502).json({ error: `Erreur Supabase : ${error.message}` })
  }
})

app.patch('/api/reservations/:id', async (request, response) => {
  try {
    await updateReservation(request.params.id, request.body)
    response.json({ saved: true })
  } catch (error) {
    response.status(502).json({ error: `Erreur Supabase : ${error.message}` })
  }
})

app.post('/api/reservations', async (request, response) => {
  const { reservation, sellerEmail, siteName = 'HoloKira' } = request.body

  if (!reservation?.id || !reservation?.email || !Array.isArray(reservation?.lines)) {
    response.status(400).json({ error: 'Reservation payload is incomplete.' })
    return
  }

  let databaseResult = { saved: false, message: 'Supabase non configuré.' }

  try {
    databaseResult = await saveReservation(reservation)
  } catch (error) {
    response.status(502).json({
      databaseSaved: false,
      emailSent: false,
      error: `Erreur Supabase : ${error.message}`,
    })
    return
  }

  if (!transporter) {
    response.json({
      databaseSaved: databaseResult.saved,
      emailSent: false,
      message: `${databaseResult.message} Configure SMTP pour recevoir un e-mail.`,
    })
    return
  }

  const lines = reservation.lines
    .map((line) => `- ${line.qty} x ${line.name} (${line.set}) - ${line.price} EUR`)
    .join('\n')
  const replyTo = reservation.email
  const destination = sellerEmail || reservationToEmail

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: destination,
      replyTo,
      subject: `[${siteName}] Nouvelle réservation ${reservation.id}`,
      text: [
        `Nouvelle réservation ${reservation.id}`,
        '',
        `Client : ${reservation.customer}`,
        `E-mail : ${reservation.email}`,
        `Téléphone : ${reservation.phone || '-'}`,
        `Total estimé : ${reservation.total} EUR`,
        `Réservée jusqu'au : ${reservation.reservedUntil || '-'}`,
        '',
        'Cartes réservées :',
        lines,
        '',
        'Message client :',
        reservation.message || '-',
      ].join('\n'),
    })
  } catch (error) {
    response.status(502).json({
      emailSent: false,
      error: `Erreur SMTP : ${error.message}`,
    })
    return
  }

  response.json({
    databaseSaved: databaseResult.saved,
    emailSent: true,
    message: `${databaseResult.message} E-mail envoyé à ${destination}.`,
  })
})

app.listen(port, () => {
  console.log(`HoloKira API listening on http://127.0.0.1:${port}`)
})
