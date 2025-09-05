using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserNameRatings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Ratings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Ratings");
        }
    }
}
