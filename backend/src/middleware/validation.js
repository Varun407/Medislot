function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
}

function isValidPhone(phone) {
    if (!phone) return false;
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    return /^[6-9]\d{9}$/.test(clean);
}

function isValidAadhar(aadhar) {
    if (!aadhar) return false;
    const clean = String(aadhar).replace(/\D/g, '');
    return /^\d{12}$/.test(clean);
}

function isValidMpin(mpin) {
    if (!mpin) return false;
    const clean = String(mpin).trim();
    return /^\d{6}$/.test(clean);
}

function isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    // At least 8 characters, at least 1 digit or symbol
    return password.length >= 8 && /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
}

function validatePatientRegistration(req, res, next) {
    const { fullName, phone, mpin, confirmMpin, aadhar, aadhaar, email, password, confirmPassword } = req.body;

    if (!fullName || !fullName.trim()) {
        return res.status(400).json({ error: 'Full name is required.' });
    }

    if (!phone || !isValidPhone(phone)) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    // MPIN validation (primary 6-digit flow) or legacy password fallback
    const targetMpin = mpin || password;
    const targetConfirm = confirmMpin || confirmPassword;

    if (!targetMpin) {
        return res.status(400).json({ error: 'A 6-digit numeric MPIN is required.' });
    }

    // Check if using 6-digit MPIN
    if (mpin !== undefined || /^\d{6}$/.test(targetMpin)) {
        if (!isValidMpin(targetMpin)) {
            return res.status(400).json({ error: 'MPIN must contain exactly 6 numeric digits (0-9).' });
        }
        if (targetMpin !== targetConfirm) {
            return res.status(400).json({ error: 'MPIN and Confirm MPIN do not match.' });
        }
    } else {
        // Fallback for legacy password registrations
        if (!isValidPassword(targetMpin)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long and contain at least one digit or symbol.'
            });
        }
        if (targetMpin !== targetConfirm) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }
    }

    const aadharInput = aadhar || aadhaar;
    if (aadharInput && !isValidAadhar(aadharInput)) {
        return res.status(400).json({ error: 'Please enter a valid 12-digit Aadhaar number.' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    req.cleanBody = {
        fullName: fullName.trim(),
        phone: cleanPhone,
        mpin: String(targetMpin).trim(),
        password: String(targetMpin).trim(),
        aadhar: aadharInput ? String(aadharInput).replace(/\D/g, '') : '',
        email: email && isValidEmail(email) ? email.trim().toLowerCase() : `patient_${cleanPhone}@medislot.local`
    };
    next();
}

function validatePatientLogin(req, res, next) {
    const rawPhone = (
        req.body.phone ||
        req.body.mobile ||
        req.body.identifier ||
        ''
    ).trim();

    const mpin = (req.body.mpin || req.body.password || '').trim();

    if (!rawPhone) {
        return res.status(400).json({ error: 'Mobile number is required.' });
    }

    const digits = rawPhone.replace(/\D/g, '');
    let cleanId = '';
    if (digits.length === 12) {
        cleanId = digits;
    } else {
        cleanId = digits.slice(-10);
        if (!/^[6-9]\d{9}$/.test(cleanId)) {
            return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
        }
    }

    if (!mpin) {
        return res.status(400).json({ error: '6-digit MPIN is required.' });
    }

    if (!/^\d{6}$/.test(mpin) && mpin.length < 6) {
        return res.status(400).json({ error: 'MPIN must contain exactly 6 numeric digits.' });
    }

    req.cleanBody = {
        phone: cleanId,
        identifier: cleanId,
        mpin,
        password: mpin
    };
    next();
}

function validateResetMpin(req, res, next) {
    const { phone, newMpin, confirmMpin, aadhar } = req.body;

    if (!phone || !isValidPhone(phone)) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    if (!newMpin || !isValidMpin(newMpin)) {
        return res.status(400).json({ error: 'New MPIN must contain exactly 6 numeric digits (0-9).' });
    }

    if (newMpin !== confirmMpin) {
        return res.status(400).json({ error: 'New MPIN and Confirm MPIN do not match.' });
    }

    req.cleanBody = {
        phone: String(phone).replace(/\D/g, '').slice(-10),
        newMpin: String(newMpin).trim(),
        aadhar: aadhar ? String(aadhar).replace(/\D/g, '') : ''
    };
    next();
}

function validateDoctorRegistration(req, res, next) {
    const {
        fullName,
        email,
        phone,
        specialization,
        qualifications,
        experienceYears,
        hospitalId,
        password,
        confirmPassword
    } = req.body;

    if (!fullName || !fullName.trim()) {
        return res.status(400).json({ error: 'Doctor full name is required.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!isValidPhone(phone)) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!specialization || !specialization.trim()) {
        return res.status(400).json({ error: 'Medical specialization is required.' });
    }
    if (!qualifications || !qualifications.trim()) {
        return res.status(400).json({ error: 'Qualifications (e.g. MBBS, MD, MS) are required.' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long and contain at least one digit or symbol.'
        });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    req.cleanBody = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: String(phone).replace(/\D/g, '').slice(-10),
        specialization: specialization.trim(),
        qualifications: qualifications.trim(),
        experienceYears: parseInt(experienceYears || 0, 10),
        hospitalId: (hospitalId || 'GH_BHIMAVARAM').trim(),
        password
    };
    next();
}

function validateLoginInput(req, res, next) {
    const rawIdentifier = (
        req.body.identifier ||
        req.body.email ||
        req.body.phone ||
        req.body.mobile ||
        req.body.aadhar ||
        req.body.aadhaar ||
        ''
    ).trim();
    const password = req.body.password || req.body.mpin;

    if (!rawIdentifier || !password) {
        return res.status(400).json({ error: 'Mobile number or Email and MPIN/Password are required.' });
    }
    req.cleanBody = {
        identifier: rawIdentifier,
        email: rawIdentifier.toLowerCase(),
        password: String(password).trim(),
        mpin: String(password).trim()
    };
    next();
}

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidAadhar,
    isValidMpin,
    isValidPassword,
    validatePatientRegistration,
    validatePatientLogin,
    validateResetMpin,
    validateDoctorRegistration,
    validateLoginInput
};
