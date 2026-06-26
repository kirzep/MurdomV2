// app/adopt/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import prisma from '@/lib/prisma';
import AdoptionCard from './AdoptionCard';

interface PageProps {
    params: { id: string };
}

// Только безопасные поля — никаких заметок, документов, создателя, медкарты.
async function getPublicCat(id: string) {
    try {
        return await prisma.cat.findUnique({
            where: { id },
            select: { id: true, name: true, avatarUrl: true, birthYear: true, arrivalDate: true, status: true },
        });
    } catch {
        return null;
    }
}

const pluralizeYears = (age: number) => {
    if (age % 10 === 1 && age % 100 !== 11) return 'год';
    if ([2, 3, 4].includes(age % 10) && ![12, 13, 14].includes(age % 100)) return 'года';
    return 'лет';
};

const getAgeLabel = (birthYear: number | null) => {
    if (!birthYear) return null;
    const age = new Date().getFullYear() - birthYear;
    if (age <= 0) return 'Котёнок';
    return `${age} ${pluralizeYears(age)}`;
};

const absoluteAvatar = (avatarUrl: string | null, name: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    if (avatarUrl) {
        if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) return avatarUrl;
        return `${appUrl}${avatarUrl}`;
    }
    return `https://placehold.co/600x600/FBE9EE/5D001E?text=${encodeURIComponent(name.charAt(0))}`;
};

const buildDescription = (name: string, ageLabel: string | null, adopted: boolean) => {
    if (adopted) return `${name} нашёл(ла) свой дом и любящую семью. Спасибо всем, кто помогал!`;
    const age = ageLabel ? ` (${ageLabel})` : '';
    return `${name}${age} ищет любящую семью и заботливого хозяина. Этот котик ждёт свой дом — поделитесь карточкой, чтобы помочь.`;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const cat = await getPublicCat(params.id);
    if (!cat || cat.status === 'Умерли') {
        return { title: 'Котик не найден' };
    }
    const adopted = cat.status === 'Дома';
    const ageLabel = getAgeLabel(cat.birthYear);
    const title = adopted ? `${cat.name} уже дома 🏡` : `${cat.name} ищет дом 🐾`;
    const description = buildDescription(cat.name, ageLabel, adopted);
    const image = absoluteAvatar(cat.avatarUrl, cat.name);

    return {
        title,
        description,
        openGraph: { title, description, images: [image], type: 'website' },
        twitter: { card: 'summary_large_image', title, description, images: [image] },
    };
}

export default async function AdoptPage({ params }: PageProps) {
    const cat = await getPublicCat(params.id);

    // Котиков «На радуге» публично не показываем
    if (!cat || cat.status === 'Умерли') {
        notFound();
    }

    const adopted = cat.status === 'Дома';
    const ageLabel = getAgeLabel(cat.birthYear);
    const arrivalLabel = cat.arrivalDate
        ? `В приюте с ${format(new Date(cat.arrivalDate), 'MMMM yyyy', { locale: ru })}`
        : null;
    const avatarSrc = absoluteAvatar(cat.avatarUrl, cat.name);
    const description = buildDescription(cat.name, ageLabel, adopted);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const shareUrl = `${appUrl}/adopt/${cat.id}`;
    const contact = process.env.NEXT_PUBLIC_SHELTER_CONTACT || null;

    return (
        <AdoptionCard
            name={cat.name}
            avatarSrc={avatarSrc}
            ageLabel={ageLabel}
            arrivalLabel={arrivalLabel}
            description={description}
            adopted={adopted}
            shareUrl={shareUrl}
            contact={contact}
        />
    );
}
