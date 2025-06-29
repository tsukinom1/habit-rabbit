import { FaTelegram, FaVk, FaInstagram, FaGithub, FaLinkedin, FaGlobe, FaQuestion } from 'react-icons/fa'


export const socialsIcons = (platform: string) => {
    if (platform === 'TELEGRAM') return <FaTelegram size={30} />
    if (platform === 'VK') return <FaVk size={30} />
    if (platform === 'INSTAGRAM') return <FaInstagram size={30} />
    if (platform === 'GITHUB') return <FaGithub size={30} />
    if (platform === 'LINKEDIN') return <FaLinkedin size={30} />
    if (platform === 'WEBSITE') return <FaGlobe size={30} />
    if (platform === 'OTHER') return <FaQuestion size={30} />
}

export const socialPlatforms = [
    { value: 'TELEGRAM', label: 'Telegram', urlTemplate: 'https://t.me/{username}' },
    { value: 'VK', label: 'ВКонтакте', urlTemplate: 'https://vk.com/{username}' },
    { value: 'INSTAGRAM', label: 'Instagram', urlTemplate: 'https://instagram.com/{username}' },
    { value: 'GITHUB', label: 'GitHub', urlTemplate: 'https://github.com/{username}' },
    { value: 'LINKEDIN', label: 'LinkedIn', urlTemplate: 'https://linkedin.com/in/{username}' },
    { value: 'WEBSITE', label: 'Веб-сайт', urlTemplate: '' }, // ручной ввод
    { value: 'OTHER', label: 'Другое', urlTemplate: '' } // ручной ввод
]