// app/api/cats/[id]/treatments/route.ts (ИЗМЕНЕН)
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role, TreatmentType } from '@prisma/client';

const treatmentTypeMap: Record<TreatmentType, string> = {
  [TreatmentType.WORMS]: 'от глистов',
  [TreatmentType.FLEAS]: 'от блох',
  [TreatmentType.EAR_MITES]: 'от ушных клещей',
  [TreatmentType.VACCINATION]: 'вакцинация',
};

const vaccinationStageMap: Record<string, string> = {
    'first': '(1 этап)',
    'second': '(2 этап)',
    'revaccination': '(ревакцинация)'
}

function isValidTreatmentType(type: any): type is TreatmentType {
    return Object.values(TreatmentType).includes(type);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    try {
        const body = await request.json();
        const { type, date, productName, vaccinationStage } = body;

        if (!isValidTreatmentType(type)) {
            return NextResponse.json({ error: 'Invalid or missing treatment type' }, { status: 400 });
        }

        if (!date || !productName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        let changeDescription = `добавил(а) обработку ${treatmentTypeMap[type]}: "${productName}"`;
        if (type === TreatmentType.VACCINATION && vaccinationStage) {
            const stageText = vaccinationStageMap[vaccinationStage] || '';
            changeDescription = `добавил(а) вакцинацию ${stageText}: "${productName}"`;
        }

        const newTreatment = await prisma.treatment.create({ 
            data: { 
                catId: params.id, 
                type, 
                date: new Date(date), 
                productName,
                vaccinationStage: type === TreatmentType.VACCINATION ? vaccinationStage : null 
            }
        });

        await prisma.auditLog.create({
            data: {
                change: changeDescription,
                catId: params.id, 
                userId: session.user.id,
            }
        });

        return NextResponse.json(newTreatment, { status: 201 });
    } catch (error) {
        console.error('Failed to add treatment:', error);
        return NextResponse.json({ error: 'Failed to add treatment' }, { status: 500 });
    }
}

// DELETE-запрос остается без изменений
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const allowedRoles: Role[] = [Role.MEDICAL_STAFF, Role.TRUSTED_PERSON, Role.DEVELOPER];
    if (!session || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const treatmentId = searchParams.get('treatmentId');
    if (!treatmentId) {
        return NextResponse.json({ error: 'Treatment ID is required' }, { status: 400 });
    }
    try {
        const treatmentToDelete = await prisma.treatment.findUnique({ where: { id: treatmentId }});
        if (treatmentToDelete) {
             await prisma.treatment.delete({ where: { id: treatmentId }});
             await prisma.auditLog.create({
                 data: {
                     change: `удалил(а) обработку: "${treatmentToDelete.productName}"`,
                     catId: params.id, userId: session.user.id,
                 }
             });
        }
        return NextResponse.json({ message: 'Treatment deleted successfully' });
    } catch (error) {
        console.error('Failed to delete treatment:', error);
        return NextResponse.json({ error: 'Failed to delete treatment' }, { status: 500 });
    }
}
