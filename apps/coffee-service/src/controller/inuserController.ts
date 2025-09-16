import { dayjs } from "@coffee/helpers";
import { UserModel, UserRoleModel } from "@coffee/models";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";

export const getUserData = () => async (req: Request, res: Response, next: NextFunction) => {

    const { information,role, limit, offset } = req.query;
    try {
          const infoStr = typeof information === 'string' ? information : undefined;
          const roles = Array.isArray(role) ? role : role ? [role] : [];
          const roleIds = roles.map(r => Number(r)).filter(r => !isNaN(r));
          
          const where = infoStr
                    ? {
                      ...(roleIds.length > 0 && { role_id: { [Op.in]: roleIds } }),
                        [Op.or]: [
                            { username: { [Op.like]: `%${infoStr}%` } },
                            { email: { [Op.like]: `%${infoStr}%` } },
                        ],
                    }
                    : {...(roleIds.length > 0 && { role_id: { [Op.in]: roleIds } }),};

        const {count, rows} = await UserModel.findAndCountAll({
            where,
            include: [
                {
                    model: UserRoleModel,
                    as: 'role'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
        })

       
        const users = rows.map((u: any) => {
            const user = u.get({ plain: true }) // แปลง Sequelize instance -> plain object
            return {
                ...user,
                time: dayjs(user.createdAt).format('DD/MM/YYYY HH:mm'),
                last_login: dayjs(user.last_login).format('DD/MM/YYYY HH:mm'),
                role: user.role.name

            }
        })

        res.locals.total = count
        res.locals.users = users
        return next()
    } catch(err) {
        next(err)
    }
}

