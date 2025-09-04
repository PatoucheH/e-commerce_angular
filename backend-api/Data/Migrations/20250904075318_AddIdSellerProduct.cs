using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend_api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIdSellerProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SellerId",
                table: "Products",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1,
                column: "SellerId",
                value: "261b56a2-1933-4742-ac36-a1e083920dac");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2,
                column: "SellerId",
                value: "261b56a2-1933-4742-ac36-a1e083920dac");

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3,
                column: "SellerId",
                value: "261b56a2-1933-4742-ac36-a1e083920dac");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "Products");
        }
    }
}
