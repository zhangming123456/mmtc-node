'use strict';
module.exports = function (sequelize, DataTypes) {
    var Role = sequelize.define("role_tbl", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            len: [3, 16]
        }
    }, {
        classMethods: {
            associate: function (models) {
                Role.hasMany(models.user_tbl);
            }
        }
    });
    return Role;
};
//# sourceMappingURL=role_tbl.js.map