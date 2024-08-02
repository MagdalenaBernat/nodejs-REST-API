const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, favorite } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'missing required name field' });
  }

  const contact = new Contact({ name, email, phone, favorite });

  try {
    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json({ message: 'contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, email, phone, favorite } = req.body;
  if (!name && !email && !phone && !favorite !== undefined) {
    return res.status(400).json({ message: 'missing fields' });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/favorite', async (req, res) => {
  const { favorite } = req.body;
  if (favorite === undefined) {
    return res.status(400).json({ message: 'missing field favorite' });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


const Joi = require('joi');

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

router.post('/', async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, phone, favorite } = req.body;
  const contact = new Contact({ name, email, phone, favorite });

  try {
    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, phone, favorite } = req.body;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});