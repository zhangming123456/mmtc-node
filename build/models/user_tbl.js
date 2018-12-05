"use strict";
// 定义用户表
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('user_tbl', {
        id: {
            type: DataTypes.UUIDV1,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV1
        },
        username: {
            type: DataTypes.STRING,
            allowNull: flase,
            len: [4, 16]
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            len: [6, 16]
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        mobile: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            len: [11, 11]
        },
        role_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
            len: [1, 2]
        }
    }, {
        // 不使用驼峰样式自动添加属性，而是下划线样式，因此updatedAt将变为updated_at
        underscored: true,
        // 禁用修改表名; 默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
        freezeTableName: true,
        classMethods: {
            associate: function (models) {
                User.belongsTo(models["role_tbl"], {
                    as: 'role_id',
                    foreignKey: {
                        allowNull: false,
                        defaultValue: 0
                    }
                });
            }
        },
        // 删除密码栏
        instanceMethods: {
            toJSON: function () {
                var values = this.get();
                delete values.password;
                return values;
            }
        }
    });
    return User;
};
//# sourceMappingURL=user_tbl.js.map