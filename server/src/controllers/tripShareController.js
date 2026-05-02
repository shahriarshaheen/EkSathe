import crypto from 'crypto';
import TripShare from '../models/TripShare.js';
import User from '../models/User.js';

// POST /api/tripshare — create a new share session
export const createTripShare = async (req, res) => {
  console.log('CLIENT_URL is:', process.env.CLIENT_URL);
  try {
    const { lat, lng, carpoolRouteId } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    // Deactivate any existing active share for this user
    await TripShare.updateMany(
      { userId: req.user.id, active: true },
      { active: false }
    );

    const token = crypto.randomBytes(16).toString('hex');
    const shareUrl = `${process.env.CLIENT_URL}/share/${token}`;

    const tripShare = await TripShare.create({
      token,
      userId: req.user.id,
      carpoolRouteId: carpoolRouteId || null,
      lat,
      lng,
      lastUpdated: new Date(),
    });

    res.status(201).json({ success: true, data: { token, shareUrl, id: tripShare._id } });
  } catch (err) {
    console.error('createTripShare error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/tripshare/:token — update location (owner only)
export const updateTripShare = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const { token } = req.params;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'lat and lng are required' });
    }

    const share = await TripShare.findOne({ token });

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }

    if (share.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (!share.active || share.expiresAt < new Date()) {
      return res.status(410).json({ success: false, message: 'This share has expired or been stopped' });
    }

    share.lat = lat;
    share.lng = lng;
    share.lastUpdated = new Date();
    await share.save();

    res.json({ success: true, data: { lat: share.lat, lng: share.lng, lastUpdated: share.lastUpdated } });
  } catch (err) {
    console.error('updateTripShare error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/tripshare/:token — stop sharing (owner only)
export const stopTripShare = async (req, res) => {
  try {
    const { token } = req.params;
    const share = await TripShare.findOne({ token });

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }

    if (share.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    share.active = false;
    await share.save();

    res.json({ success: true, message: 'Location sharing stopped' });
  } catch (err) {
    console.error('stopTripShare error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/tripshare/:token — public, no auth
export const getTripShare = async (req, res) => {
  try {
    const { token } = req.params;

    const share = await TripShare.findOne({ token }).populate('userId', 'name');

    if (!share || !share.active || share.expiresAt < new Date()) {
      return res.status(404).json({ success: false, message: 'This share is no longer active' });
    }

    res.json({
      success: true,
      data: {
        lat: share.lat,
        lng: share.lng,
        lastUpdated: share.lastUpdated,
        active: share.active,
        userName: share.userId?.name || 'Someone',
      },
    });
  } catch (err) {
    console.error('getTripShare error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};