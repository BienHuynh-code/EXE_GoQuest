import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { calculateDistance } from '../utils/geo'

/* ─── Task data ─────────────────────────────────────────────────── */
const TASKS = [
    {
        id: 1, title: 'Làm bánh dân gian', icon: '',
        description: 'Trải nghiệm tự tay nhào bột và chế biến các món bánh truyền thống miền Tây.',
        type: 'craft', category: 'short-term', points: 150, duration: 45,
        location: 'Khu Workshop - Nhà văn hóa Cồn Sơn',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnpa5y1tvT8SEueZWJ770KfqJIprwJq4ZHCYji_3q_wzyYGWUFlA8Ft5Td3JnDcvCXKyr4SkXM_o3KiZv4HFausnJAl7NwRyV67HyytiTjHemrsVXDoEQoVduY6b9CK8rj7xkgklCdeAozxL8GVlk3vi3qapNNhcE9uOORGghN08nwoEJ-PGkCrnGCj0i7tz5yxAq6Z4iIYDUIWhk5UOrI4hrUFVRTlPx5CS0RZvRovRs1nfQShdsNbqCui01kXvf4dwViUBhP',
    },
    {
        id: 2, title: 'Vẽ nón lá', icon: '',
        description: 'Sáng tạo nghệ thuật trên chiếc nón lá đặc trưng của người Việt Nam.',
        type: 'craft', category: 'short-term', points: 100, duration: 30,
        location: 'Quầy Chú Năm - Khu thủ công',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIr4-rkCWlX3jVPgIN5zRRGBuVDdfDYIxR9TrpsSIr6KKgORVDd8199MEIXDW7hcRzxq63ucMEjVS2d1E0YjhgYG3Km-sLhXckW62dfHJX1u_RjLh67PPZdl3pzZM_MvNBiPv5PkWCywRWQLKQaiSzdimlIMFvlSnDHXNwR5GA5eSeR7lbsNGyxVTIkO5oWdFWV_eFK2iyE2UkPAcASDmQ8TE0xzZ7YEV4tk6gIfhYV_zE6GFKTj26wzw7TrMUFSpcZNHldYBR',
    },
    {
        id: 3, title: 'Thử thách 5000 bước', icon: '',
        description: 'Đi dạo quanh Cồn Sơn và khám phá thiên nhiên tươi đẹp nơi đây.',
        type: 'health', category: 'short-term', points: 80, duration: 60,
        location: 'Toàn bộ Cồn Sơn',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBXVEwHBNpC_6hVfL8l8odhSefM0c0dskGy9RyPY_QDekMLye0JDXs_dHK43SDrCQVVlHrhXXwCh-UCe4LwBGAYvcBvXHzbkZT0ErUX80jTt1et7btQcaTL5zauOXCVk06_EWJsGmRk4pDxJFEertk3LZrBGJBjvrX_D5uKOSRwQjC--922_gIBCX9NrH8W_KWQMh7V09kdqc4wvqQV1h4zudvmutkZpvqTSu_zDC8TqN-gIbghG-a0VyjVMlMJu2JNMYIHBv7',
    },
    {
        id: 4, title: 'Sử dụng bình nước cá nhân', icon: '',
        description: 'Hạn chế rác thải nhựa bằng cách sử dụng bình nước tái sử dụng tại các trạm.',
        type: 'environment', category: 'short-term', points: 50, duration: 0,
        location: 'Toàn bộ Cồn Sơn',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC5dKo1FVBNNBYdZMl6aEdFdkPUYTwzqFbKabgxz9J_oL06l09XAeeYc62L4HDxMjPq7hcn6GzRY3TxF25iJBe14nGV8UEiEMmg_m6nvFFzybXPZ7ZWT3ydHTe4dhk54CnZ3o4v12gYc2ke3jCMZODO4eE0fPYtd7RX6BmtUKt-qdTrbu97pp9uE6b96DOhJ4rgqlBjDJrNhKydJU3yx3UvnJGxxVcZU8Pae5SroK2ftuDpnB8QKEA0qRI-xbc61XuVGdyuTU4',
    },
    {
        id: 5, title: 'Thưởng thức Bánh Xèo', icon: '',
        description: 'Đến quầy bánh dân gian thưởng thức món bánh xèo giòn rụm đặc trưng miền Tây.',
        type: 'food', category: 'short-term', points: 60, duration: 20,
        location: 'Quầy Cô Ba - Đầu đường chính',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnpa5y1tvT8SEueZWJ770KfqJIprwJq4ZHCYji_3q_wzyYGWUFlA8Ft5Td3JnDcvCXKyr4SkXM_o3KiZv4HFausnJAl7NwRyV67HyytiTjHemrsVXDoEQoVduY6b9CK8rj7xkgklCdeAozxL8GVlk3vi3qapNNhcE9uOORGghN08nwoEJ-PGkCrnGCj0i7tz5yxAq6Z4iIYDUIWhk5UOrI4hrUFVRTlPx5CS0RZvRovRs1nfQShdsNbqCui01kXvf4dwViUBhP',
    },
    {
        id: 6, title: 'Trải nghiệm Bán Hàng', icon: '',
        description: 'Đứng quầy bán bánh tráng trộn cùng người dân địa phương trong 30 phút.',
        type: 'community', category: 'short-term', points: 70, duration: 30,
        location: 'Khu ẩm thực đường chính',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBXVEwHBNpC_6hVfL8l8odhSefM0c0dskGy9RyPY_QDekMLye0JDXs_dHK43SDrCQVVlHrhXXwCh-UCe4LwBGAYvcBvXHzbkZT0ErUX80jTt1et7btQcaTL5zauOXCVk06_EWJsGmRk4pDxJFEertk3LZrBGJBjvrX_D5uKOSRwQjC--922_gIBCX9NrH8W_KWQMh7V09kdqc4wvqQV1h4zudvmutkZpvqTSu_zDC8TqN-gIbghG-a0VyjVMlMJu2JNMYIHBv7',
    },
]

const MAP_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrqeys7w8p3z_rdRnyMvr2LmXYwytkMD5WDPA4DKjQwLlT03ZYBAScnFdpfM6mxwUIJ9JDTNeGw-hjJ9PA8dtfn7jRx2OyrzJYxRSk60-a6TvPqolcMPRsAwiryDsczLTZ5bHPRSSiSDbN44Rtl3HpnnHdgeuzMak2DrmLkOMKj3HgP6gGLRypFmlFiXrymTuqPnI345DEo0BH6iB68uBmJzsKc3MWzuEqlOlyxGkwuVn53iHAEfztVWJDDl2ST0jblkqOabwR'

function getRank(pts) {
    if (pts >= 1000) return { name: 'Hạng Vàng', icon: '', next: null, need: 0 }
    if (pts >= 500) return { name: 'Hạng Bạc', icon: '', next: 'Hạng Vàng', need: 1000 - pts }
    return { name: 'Hạng Đồng', icon: '', next: 'Hạng Bạc', need: 500 - pts }
}

/* ─── Dashboard ─────────────────────────────────────────────────── */
export default function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [completedIds, setCompletedIds] = useState([])
    const [toast, setToast] = useState(null)
    const [toastType, setToastType] = useState('success')
    const [activeNav, setActiveNav] = useState('journey')
    const [searchVal, setSearchVal] = useState('')
    const [celebrateId, setCelebrateId] = useState(null)
    const [isTracking, setIsTracking] = useState(false)
    const [distance, setDistance] = useState(0)
    const watchRef = useRef(null)
    const lastPosRef = useRef(null)

    /* fetch previous completions */
    useEffect(() => {
        api.get('/tasks/progress').then(r => {
            const done = r.data.tasks?.filter(t => t.isCompleted).map(t => Number(t._id)) || []
            setCompletedIds(done)
        }).catch(() => { })
    }, [])

    /* GPS tracking */
    useEffect(() => {
        if (isTracking) {
            if (!navigator.geolocation) { showToast('Trình duyệt không hỗ trợ GPS', 'error'); return }
            watchRef.current = navigator.geolocation.watchPosition(pos => {
                const { latitude: lat, longitude: lng } = pos.coords
                if (lastPosRef.current) {
                    const d = calculateDistance(lastPosRef.current.lat, lastPosRef.current.lng, lat, lng)
                    if (d > 3) setDistance(prev => prev + d)
                }
                lastPosRef.current = { lat, lng }
            }, () => { }, { enableHighAccuracy: true })
        } else {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
        }
        return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current) }
    }, [isTracking])

    const showToast = (msg, type = 'success') => {
        setToast(msg); setToastType(type)
        setTimeout(() => setToast(null), 3000)
    }

    const handleComplete = async (taskId) => {
        if (completedIds.includes(taskId)) return
        try { await api.post(`/tasks/complete/${taskId}`) } catch { }
        setCompletedIds(p => [...p, taskId])
        setCelebrateId(taskId)
        setTimeout(() => setCelebrateId(null), 800)
        showToast('Chúc mừng! Bạn đã hoàn thành nhiệm vụ!')
    }

    const handleLogout = () => { logout(); navigate('/') }

    /* computed */
    const totalPts = TASKS.filter(t => completedIds.includes(t.id)).reduce((s, t) => s + t.points, 0)
    const pct = Math.round((completedIds.length / TASKS.length) * 100)
    const barPct = Math.min((totalPts / 1000) * 100, 100)
    const rank = getRank(totalPts)
    const filteredTasks = TASKS.filter(t =>
        t.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        t.description.toLowerCase().includes(searchVal.toLowerCase())
    )

    /* recent activity — show completed tasks */
    const recentDone = TASKS.filter(t => completedIds.includes(t.id)).slice(-3).reverse()
    const staticActivities = [
        { emoji: '', label: 'Đã hoàn thành 5000 bước', time: 'Hôm nay, 10:30 AM' },
        { emoji: '', label: 'Đổi quà: Nước mắm Cồn Sơn', time: 'Hôm qua, 04:15 PM' },
        { emoji: '', label: 'Nhận 50 điểm ẩm thực', time: '22 Tháng 10, 2023' },
    ]
    const activities = recentDone.length
        ? recentDone.map(t => ({ emoji: t.icon, label: `Hoàn thành: ${t.title}`, time: `+${t.points} điểm · Vừa xong` }))
        : staticActivities

    const navItems = [
        { key: 'journey', icon: '', label: 'Hành trình' },
        { key: 'tasks', icon: '', label: 'Nhiệm vụ' },
        { key: 'rank', icon: '', label: 'Hạng của bạn' },
        { key: 'challenges', icon: '', label: 'Thử thách' },
    ]

    /* ─── Render ─── */
    return (
        <div className="dsh-root">

            {/* ══════════ HEADER ══════════ */}
            <header className="dsh-header">
                <div className="dsh-header-left">
                    <Link to="/" className="dsh-logo">
                        <span className="dsh-logo-icon"></span>
                        <span className="dsh-logo-name">Con Son Travel</span>
                    </Link>
                    <nav className="dsh-top-nav">
                        <a className="dsh-top-link" href="#">Trang chủ</a>
                        <a className="dsh-top-link dsh-top-link--active" href="#">Hành trình</a>
                        <a className="dsh-top-link" href="#">Cộng đồng</a>
                        <a className="dsh-top-link" href="#">Ưu đãi</a>
                    </nav>
                </div>
                <div className="dsh-header-right">
                    <div className="dsh-search-box">
                        <span className="dsh-search-icon">🔍</span>
                        <input
                            className="dsh-search-input"
                            placeholder="Tìm kiếm hành trình..."
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                        />
                    </div>
                    <button className="dsh-icon-btn" title="Thông báo"></button>
                    <div className="dsh-avatar-btn" title={user?.displayName}>
                        {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
                    </div>
                </div>
            </header>

            {/* ══════════ BODY ══════════ */}
            <div className="dsh-body">

                {/* ── LEFT SIDEBAR ── */}
                <aside className="dsh-sidebar">
                    <div className="dsh-sidebar-card">
                        <div className="dsh-user-row">
                            <div className="dsh-user-avatar">
                                {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="dsh-user-name">{user?.displayName || user?.username}</div>
                                <div className="dsh-user-sub">Khám phá Cồn Sơn</div>
                            </div>
                        </div>
                        <nav className="dsh-side-nav">
                            {navItems.map(item => (
                                <button
                                    key={item.key}
                                    className={`dsh-side-link ${activeNav === item.key ? 'dsh-side-link--active' : ''}`}
                                    onClick={() => setActiveNav(item.key)}
                                >
                                    <span>{item.icon}</span> {item.label}
                                </button>
                            ))}
                            <button className="dsh-side-link dsh-side-link--logout" onClick={handleLogout}>
                                <span></span> Đăng xuất
                            </button>
                        </nav>
                    </div>

                    {/* Weekly Challenge */}
                    <div className="dsh-challenge-card">
                        <div className="dsh-challenge-title">Thử thách tuần này</div>
                        <div className="dsh-challenge-row">
                            <span className="dsh-challenge-icon"></span>
                            <div>
                                <div className="dsh-challenge-name">Không rác nhựa</div>
                                <div className="dsh-challenge-sub">Hoàn thành 3 ngày liên tục</div>
                            </div>
                        </div>
                        <div className="dsh-challenge-bar">
                            <div className="dsh-challenge-fill" style={{ width: '66%' }} />
                        </div>
                        <div className="dsh-challenge-count">2/3 Ngày</div>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="dsh-main">

                    {/* Hero */}
                    <section className="dsh-hero-card">
                        <div className="dsh-hero-info">
                            <h1 className="dsh-hero-title">Hành trình của bạn</h1>
                            <p className="dsh-hero-sub">
                                Theo dõi tiến độ và hoàn thành các nhiệm vụ trải nghiệm đặc sắc tại Cồn Sơn để nhận quà hấp dẫn.
                            </p>
                        </div>
                        <div className="dsh-hero-stats">
                            <div className="dsh-stat">
                                <span className="dsh-stat-num">{pct}%</span>
                                <span className="dsh-stat-lbl">Hoàn thành</span>
                            </div>
                            <div className="dsh-stat-sep" />
                            <div className="dsh-stat">
                                <span className="dsh-stat-num dsh-stat-num--dark">{totalPts}</span>
                                <span className="dsh-stat-lbl">Điểm tích lũy</span>
                            </div>
                        </div>
                        <div className="dsh-hero-bar-wrap">
                            <div className="dsh-hero-bar-labels">
                                <span>Tiến độ hiện tại</span>
                                <span>Mục tiêu: 1000 điểm</span>
                            </div>
                            <div className="dsh-hero-bar-track">
                                <div className="dsh-hero-bar-fill" style={{ width: `${barPct}%` }} />
                            </div>
                        </div>
                    </section>

                    {/* Task Grid */}
                    <section>
                        <div className="dsh-section-head">
                            <h2 className="dsh-section-title">
                                <span style={{ color: 'var(--color-accent-primary)' }}></span>
                                &nbsp;Nhiệm vụ trải nghiệm
                            </h2>
                            <button className="dsh-see-all">Xem tất cả</button>
                        </div>

                        <div className="dsh-task-grid">
                            {filteredTasks.map(task => {
                                const done = completedIds.includes(task.id)
                                const celebrating = celebrateId === task.id
                                return (
                                    <article
                                        key={task.id}
                                        className={`dsh-task-card ${done ? 'dsh-task-card--done' : ''} ${celebrating ? 'dsh-task-card--celebrate' : ''}`}
                                    >
                                        {/* Image */}
                                        <div className="dsh-task-img-wrap">
                                            <img
                                                src={task.img}
                                                alt={task.title}
                                                className="dsh-task-img"
                                                loading="lazy"
                                            />
                                            <div className={`dsh-pts-badge ${done ? 'dsh-pts-badge--done' : ''}`}>
                                                {done ? '✓ Hoàn thành' : `⭐ +${task.points} Điểm`}
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className={`dsh-task-body ${done ? 'dsh-task-body--done' : ''}`}>
                                            <h3 className="dsh-task-name">{task.title}</h3>
                                            <p className="dsh-task-desc">{task.description}</p>
                                            <button
                                                className={`dsh-task-btn ${done ? 'dsh-task-btn--done' : ''}`}
                                                onClick={() => handleComplete(task.id)}
                                                disabled={done}
                                            >
                                                {done ? 'Đã nhận thưởng' : 'Bắt đầu ngay'}
                                            </button>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>

                        {/* GPS Tracking card */}
                        <div className="dsh-gps-card">
                            <div className="dsh-gps-left">
                                <span className="dsh-gps-icon">{isTracking ? '' : ''}</span>
                                <div>
                                    <div className="dsh-gps-title">Hành trình khám phá</div>
                                    <div className="dsh-gps-dist">{Math.round(distance)}m đã di chuyển</div>
                                </div>
                            </div>
                            <button
                                className={`dsh-gps-btn ${isTracking ? 'dsh-gps-btn--stop' : ''}`}
                                onClick={() => setIsTracking(t => !t)}
                            >
                                {isTracking ? 'Dừng' : 'Bắt đầu'}
                            </button>
                        </div>
                    </section>
                </main>

                {/* ── RIGHT SIDEBAR ── */}
                <aside className="dsh-aside">

                    {/* Rank Card */}
                    <div className="dsh-rank-card">
                        <div className="dsh-rank-bg"></div>
                        <div className="dsh-rank-content">
                            <span className="dsh-rank-badge">Hạng hiện tại</span>
                            <h2 className="dsh-rank-name">{rank.name}</h2>
                            {rank.next
                                ? <p className="dsh-rank-desc">Cần {rank.need} điểm để lên {rank.next}</p>
                                : <p className="dsh-rank-desc">Bạn đã đạt hạng cao nhất!</p>
                            }
                            <div className="dsh-rank-icon-row">
                                <span style={{ fontSize: '3.2rem' }}>{rank.icon}</span>
                                <div>
                                    <div className="dsh-rank-pts-lbl">Điểm tiếp theo</div>
                                    <div className="dsh-rank-pts">{rank.next ? (rank.next === 'Hạng Bạc' ? 500 : 1000) : '—'} Pts</div>
                                </div>
                            </div>
                            <button className="dsh-rank-btn">Xem đặc quyền</button>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="dsh-sidebar-card">
                        <h3 className="dsh-activities-title">Hoạt động gần đây</h3>
                        <ul className="dsh-activities">
                            {activities.map((a, i) => (
                                <li key={i} className="dsh-activity-row">
                                    <div className="dsh-activity-icon">{a.emoji}</div>
                                    <div>
                                        <div className="dsh-activity-lbl">{a.label}</div>
                                        <div className="dsh-activity-time">{a.time}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Map */}
                    <div className="dsh-map-card">
                        <img src={MAP_IMG} alt="Bản đồ Cồn Sơn" className="dsh-map-img" />
                        <div className="dsh-map-overlay">
                            <p className="dsh-map-title">Bản đồ trải nghiệm Cồn Sơn</p>
                            <p className="dsh-map-sub">Nhấn để xem các địa điểm nhiệm vụ</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className="dsh-footer">
                <div className="dsh-footer-inner">
                    <div className="dsh-footer-brand">
                        <span></span>
                        <span>© 2024 Con Son Travel. Tất cả quyền được bảo lưu.</span>
                    </div>
                    <div className="dsh-footer-links">
                        <a href="#">Điều khoản</a>
                        <a href="#">Bảo mật</a>
                        <a href="#">Hỗ trợ</a>
                    </div>
                </div>
            </footer>

            {/* Toast */}
            {toast && (
                <div className={`dsh-toast ${toastType === 'error' ? 'dsh-toast--error' : ''}`}>
                    {toast}
                </div>
            )}
        </div>
    )
}
