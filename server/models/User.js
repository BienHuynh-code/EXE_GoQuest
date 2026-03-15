const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    displayName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'staff'],
        default: 'user'
    },
    completedTasks: [{
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    activeMissions: [{
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        startTime: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date
        },
        status: {
            type: String,
            enum: ['started', 'completed', 'expired'],
            default: 'started'
        }
    }],
    longTermProgress: {
        steps: {
            type: Number,
            default: 0
        },
        distance: {
            type: Number,
            default: 0
        },
        usingPersonalBottle: {
            type: Boolean,
            default: false
        }
    },
    redeemedGifts: [{
        giftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gift'
        },
        giftTitle: String,
        pointsSpent: {
            type: Number,
            default: 0
        },
        redeemedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate current points
userSchema.methods.calculatePoints = async function () {
    const Task = mongoose.model('Task');
    const tasks = await Task.find({ isActive: true });
    
    const completedTaskIds = (this.completedTasks || []).map(t => t.taskId?.toString());
    const basePts = tasks
        .filter(t => completedTaskIds.includes(t._id.toString()))
        .reduce((sum, t) => sum + (t.points || 0), 0);
        
    const plasticPts = this.longTermProgress?.usingPersonalBottle ? 50 : 0;
    const distancePts = (this.longTermProgress?.distance || 0) >= 2000 ? 100 : 0;
    
    // Total steps logic could also go here
    const stepsPts = Math.floor((this.longTermProgress?.steps || 0) / 1000) * 10;
    
    const spentPts = (this.redeemedGifts || []).reduce((sum, g) => sum + (g.pointsSpent || 0), 0);
    
    return basePts + plasticPts + distancePts + stepsPts - spentPts;
};

module.exports = mongoose.model('User', userSchema);
