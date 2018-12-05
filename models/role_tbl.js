'use strict'

module.exports = (sequelize, DataTypes) => {
    let Role = sequelize.define(
        "role_tbl",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                len: [3, 16]
            }
        },
        {
            // 不使用驼峰样式自动添加属性，而是下划线样式，因此updatedAt将变为updated_at
            underscored: true,
            // 禁用修改表名; 默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
            freezeTableName: true,
            classMethods: {}
        });
    Role.associate = function (models) {
        Role.hasMany(
            models[`user_tbl`],
            {
                as: 'user',
                foreignKey: 'role'
            }
        )
    };
    return Role
};
